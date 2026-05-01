import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { freeAuditStartSchema } from "@/lib/validators";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("free_audit_start");

  try {
    const body = freeAuditStartSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const email = body.email.toLowerCase().trim();
    const firstName = body.firstName.trim();
    const companyName = body.companyName.trim();

    await logTransaction({ traceId, eventName: "free_audit_lead_started", route: "/api/free-audit/start", email, status: "started" });

    const { data: user, error: userError } = await supabase
      .from("public_users")
      .upsert(
        {
          full_name: firstName,
          email,
          mobile: "not provided",
          country: "Unknown",
          company: companyName,
          website: null,
          source: "free_audit_started"
        },
        { onConflict: "email" }
      )
      .select("id,email,full_name,country,company")
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || "Unable to save audit lead." }, { status: 500 });
    }

    const { data: audit, error: auditError } = await supabase
      .from("free_audit_requests")
      .insert({
        user_id: user.id,
        industry: "Sales automation",
        business_type: "Sales team",
        company_website: null,
        target_market: null,
        monthly_leads: null,
        average_order_value: null,
        current_tools: null,
        response_time: null,
        team_size: null,
        biggest_problem: "Audit started but questions not completed yet",
        growth_goal: "Free sales automation audit",
        opportunity_score: 0,
        roi_potential: "Pending questions",
        recommended_agent_ids: [],
        report_json: {
          status: "started",
          firstName,
          email,
          companyName,
          startedAt: new Date().toISOString()
        },
        report_text: "Audit started. Visitor has not completed questions yet.",
        consent_status: "accepted",
        email_status: "not_sent"
      })
      .select("id")
      .single();

    if (auditError || !audit) {
      return NextResponse.json({ error: auditError?.message || "Unable to create audit tracking record." }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: user.id,
      activity_type: "free_audit_started",
      details: {
        auditId: audit.id,
        companyName,
        traceId
      }
    });

    await logTransaction({ traceId, eventName: "free_audit_lead_saved", route: "/api/free-audit/start", userId: user.id, email, status: "completed", metadata: { auditId: audit.id } });

    return NextResponse.json({ ok: true, traceId, userId: user.id, auditId: audit.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save audit lead.";
    await logTransaction({ traceId, level: "error", eventName: "free_audit_start_failed", route: "/api/free-audit/start", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
