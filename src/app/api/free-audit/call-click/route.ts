import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { freeAuditCallClickSchema } from "@/lib/validators";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("free_audit_call_click");

  try {
    const body = freeAuditCallClickSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const email = body.email.toLowerCase().trim();

    const { data: user } = await supabase
      .from("public_users")
      .select("id,email,full_name,company")
      .eq("email", email)
      .maybeSingle();

    if (user?.id) {
      await supabase.from("activity_timeline").insert({
        user_id: user.id,
        activity_type: "free_audit_strategy_call_clicked",
        details: {
          auditId: body.auditId || null,
          companyName: body.companyName || user.company || "",
          traceId
        }
      });
    }

    if (body.auditId) {
      const { data: audit } = await supabase
        .from("free_audit_requests")
        .select("report_json")
        .eq("id", body.auditId)
        .maybeSingle();

      await supabase
        .from("free_audit_requests")
        .update({
          report_json: {
            ...(audit?.report_json && typeof audit.report_json === "object" ? audit.report_json : {}),
            status: "strategy_call_clicked",
            strategyCallClickedAt: new Date().toISOString()
          }
        })
        .eq("id", body.auditId);
    }

    await logTransaction({ traceId, eventName: "free_audit_strategy_call_clicked", route: "/api/free-audit/call-click", email, userId: user?.id, status: "completed", metadata: { auditId: body.auditId || null } });

    return NextResponse.json({ ok: true, traceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to track call click.";
    await logTransaction({ traceId, level: "error", eventName: "free_audit_call_click_failed", route: "/api/free-audit/call-click", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
