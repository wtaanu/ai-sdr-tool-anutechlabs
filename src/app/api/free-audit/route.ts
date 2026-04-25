import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { freeAuditSchema } from "@/lib/validators";
import { createFreeAuditReport, formatAuditReportText, type FreeAuditReport } from "@/lib/freeAudit";
import { createSimplePdfBase64 } from "@/lib/simplePdf";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("free_audit");
  try {
    const body = freeAuditSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    await logTransaction({ traceId, eventName: "free_audit_started", route: "/api/free-audit", userId: body.userId, status: "started" });

    const { data: user, error: userError } = await supabase
      .from("public_users")
      .select("id,email,full_name,country,company,is_email_verified")
      .eq("id", body.userId)
      .eq("is_email_verified", true)
      .maybeSingle();

    if (userError || !user) {
      await logTransaction({ traceId, level: "warn", eventName: "free_audit_unverified_user", route: "/api/free-audit", userId: body.userId, status: "blocked" });
      return NextResponse.json({ error: "Verified profile not found. Please subscribe and verify first." }, { status: 403 });
    }

    await supabase.from("consent_logs").insert({
      user_id: body.userId,
      consent_type: "free_ai_audit",
      status: "accepted",
      country: user.country,
      policy_version: "draft",
      source_url: "free_audit_form"
    });

    const report: FreeAuditReport = await createFreeAuditReport({
      fullName: user.full_name,
      email: user.email,
      company: user.company,
      country: user.country,
      industry: body.industry,
      businessType: body.businessType,
      companyWebsite: body.companyWebsite,
      targetMarket: body.targetMarket,
      monthlyLeads: body.monthlyLeads,
      averageOrderValue: body.averageOrderValue,
      currentTools: body.currentTools,
      responseTime: body.responseTime,
      teamSize: body.teamSize,
      biggestProblem: body.biggestProblem,
      growthGoal: body.growthGoal
    });
    const reportText = formatAuditReportText(report);
    const pdfBase64 = createSimplePdfBase64(report.headline, reportText);

    const { data: audit, error: auditError } = await supabase
      .from("free_audit_requests")
      .insert({
        user_id: body.userId,
        industry: body.industry,
        business_type: body.businessType,
        company_website: body.companyWebsite || null,
        target_market: body.targetMarket || null,
        monthly_leads: body.monthlyLeads || null,
        average_order_value: body.averageOrderValue || null,
        current_tools: body.currentTools || null,
        response_time: body.responseTime || null,
        team_size: body.teamSize || null,
        biggest_problem: body.biggestProblem,
        growth_goal: body.growthGoal,
        opportunity_score: report.opportunityScore,
        roi_potential: report.roiPotential,
        recommended_agent_ids: report.matchedAgents.map((agent) => agent.id),
        report_json: report,
        report_text: reportText,
        consent_status: "accepted"
      })
      .select("id")
      .single();

    if (auditError) {
      await logTransaction({ traceId, level: "error", eventName: "free_audit_insert_failed", route: "/api/free-audit", userId: body.userId, email: user.email, status: "failed", detail: auditError.message });
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: body.userId,
      activity_type: "free_audit_completed",
      details: {
        auditId: audit.id,
        opportunityScore: report.opportunityScore,
        roiPotential: report.roiPotential,
        recommendedAgents: report.matchedAgents.map((agent) => agent.name)
      }
    });

    const emailResult = await sendBrandedEmail({
      to: [
        {
          email: user.email,
          firstName: user.full_name.split(" ")[0],
          company: user.company || body.businessType,
          country: user.country,
          persona: "free_audit",
          target: body.growthGoal
        }
      ],
      subject: "Your free AI automation audit report",
      content: withComplianceFooter(`Hi {{first_name}},

Your free AI automation audit is ready.

${report.emailSummary}

Opportunity score: ${report.opportunityScore}/100
ROI potential: ${report.roiPotential}

The PDF report is attached. It includes recommended AI agents, analytics, roadmap, quick wins, and next steps.`),
      attachments: [
        {
          filename: "anutechlabs-free-ai-audit.pdf",
          contentBase64: pdfBase64,
          contentType: "application/pdf"
        }
      ]
    });

    await supabase.from("free_audit_requests").update({ email_status: emailResult.status }).eq("id", audit.id);
    await supabase.from("email_logs").insert({
      user_id: body.userId,
      email_type: "free_audit_report",
      subject: "Your free AI automation audit report",
      status: emailResult.status,
      provider_message_id: emailResult.detail,
      sent_at: emailResult.sent ? new Date().toISOString() : null
    });

    await logTransaction({ traceId, eventName: "free_audit_completed", route: "/api/free-audit", userId: body.userId, email: user.email, status: "completed", metadata: { auditId: audit.id, emailStatus: emailResult.status, score: report.opportunityScore } });

    return NextResponse.json({ ok: true, traceId, auditId: audit.id, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create free audit.";
    await logTransaction({ traceId, level: "error", eventName: "free_audit_failed", route: "/api/free-audit", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
