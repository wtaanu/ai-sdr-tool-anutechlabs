import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { freeAuditSchema } from "@/lib/validators";
import { createBrandedPdfBase64 } from "@/lib/simplePdf";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { createSalesWasteAudit, formatMoney, formatSalesAuditText } from "@/lib/salesAudit";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("free_audit");

  try {
    const body = freeAuditSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const email = body.email.toLowerCase().trim();
    const firstName = body.firstName.trim();
    const companyName = body.companyName.trim();

    await logTransaction({ traceId, eventName: "free_audit_started", route: "/api/free-audit", email, status: "started" });

    const report = createSalesWasteAudit({
      firstName,
      email,
      companyName,
      salespeople: body.salespeople,
      salesCycle: body.salesCycle,
      biggestWaste: body.biggestWaste
    });
    const reportText = formatSalesAuditText(report);
    const pdfBase64 = createBrandedPdfBase64([
      {
        type: "hero",
        title: `Your Sales Team Is Wasting ${formatMoney(report.totalAnnualCost)} Per Year`,
        subtitle: `Personalized audit for ${companyName}. Here is exactly where manual sales work is costing time, money, and follow-up consistency.`,
        metric: `${report.totalWeeklyHours} hrs/wk`,
        label: "manual work detected"
      },
      { type: "stat", label: "Annual manual-work cost", value: formatMoney(report.totalAnnualCost), note: "Current estimated leakage" },
      { type: "stat", label: "Potential savings", value: `${formatMoney(report.totalSavingsAnnual)}/yr`, note: "After automation rollout" },
      { type: "stat", label: "Time reclaimed", value: `${report.totalFreedHours} hrs/wk`, note: `Timeline: ${report.timeline}` },
      { type: "section", title: "Cost Breakdown By Activity" },
      ...report.activities.map((activity) => ({
        type: "bar" as const,
        label: activity.label,
        value: `${formatMoney(activity.annualCost)}/yr`,
        percent: Math.round((activity.monthlyCost / report.totalMonthlyCost) * 100),
        note: `${activity.hoursPerWeek} hours/week. Current approach: ${activity.currentApproach}. Quick win: ${activity.quickWin}.`
      })),
      { type: "section", title: "Optimization Roadmap" },
      ...report.roadmap.slice(0, 4).map((activity, index) => ({
        type: "bar" as const,
        label: `Priority ${index + 1}: ${activity.label}`,
        value: `${formatMoney(activity.savingsAnnual)}/yr`,
        percent: Math.min(100, Math.round((activity.savingsAnnual / report.totalSavingsAnnual) * 100)),
        note: `Save ${activity.freedHours} hours/week. Implementation: ${activity.implementation}. Monthly savings: ${formatMoney(activity.savingsMonthly)}.`
      })),
      { type: "section", title: "Implementation Plan" },
      ...report.phases.map((phase) => ({
        type: "text" as const,
        text: `${phase.week} - ${phase.title}: ${phase.action}. Tools: ${phase.tools}. Setup: ${phase.setupTime}. Ongoing: ${phase.ongoing}. Result: ${phase.result}.`
      })),
      { type: "section", title: "Next Step" },
      {
        type: "text",
        text: `Book a 30-minute strategy call to validate these numbers with your actual data, choose the fastest ROI phase, and map the first 90 days.`
      }
    ]);

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
          source: "free_audit"
        },
        { onConflict: "email" }
      )
      .select("id,email,full_name,country,company")
      .single();

    if (userError || !user) {
      await logTransaction({ traceId, level: "error", eventName: "free_audit_user_upsert_failed", route: "/api/free-audit", email, status: "failed", detail: userError?.message });
      return NextResponse.json({ error: userError?.message || "Unable to create user profile." }, { status: 500 });
    }

    await supabase.from("consent_logs").insert({
      user_id: user.id,
      consent_type: "free_ai_audit",
      status: "accepted",
      country: user.country,
      policy_version: "sales-audit-2026-05",
      source_url: "free_audit_form"
    });

    const auditPayload = {
        user_id: user.id,
        industry: "Sales automation",
        business_type: "Sales team",
        company_website: null,
        target_market: null,
        monthly_leads: body.salespeople,
        average_order_value: body.salesCycle,
        current_tools: body.biggestWaste,
        response_time: body.salesCycle,
        team_size: body.salespeople,
        biggest_problem: `${body.biggestWaste} wastes the most time`,
        growth_goal: "Reclaim sales team time and reduce manual work",
        opportunity_score: Math.min(100, Math.max(65, Math.round(report.totalFreedHours * 2.4))),
        roi_potential: `${formatMoney(report.totalSavingsAnnual)}/year potential savings`,
        recommended_agent_ids: [],
        report_json: {
          ...report,
          status: "summary_generated",
          summaryGeneratedAt: new Date().toISOString()
        },
        report_text: reportText,
        consent_status: "accepted"
      };

    const auditMutation = body.auditId
      ? supabase
          .from("free_audit_requests")
          .update(auditPayload)
          .eq("id", body.auditId)
      : supabase
          .from("free_audit_requests")
          .insert(auditPayload);

    const { data: audit, error: auditError } = await auditMutation
      .select("id")
      .single();

    if (auditError) {
      await logTransaction({ traceId, level: "error", eventName: "free_audit_insert_failed", route: "/api/free-audit", userId: user.id, email: user.email, status: "failed", detail: auditError.message });
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: user.id,
      activity_type: "free_audit_completed",
      details: {
        auditId: audit.id,
        salespeople: body.salespeople,
        salesCycle: body.salesCycle,
        biggestWaste: body.biggestWaste,
        totalAnnualCost: report.totalAnnualCost,
        totalSavingsAnnual: report.totalSavingsAnnual,
        totalFreedHours: report.totalFreedHours
      }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anutechlabs.company";
    const meetingUrl = process.env.DEFAULT_MEETING_URL || `${siteUrl}/#contact-us`;
    const emailSubject = `Your Sales Automation Audit Results (${formatMoney(report.totalSavingsAnnual)} opportunity)`;
    const auditEmailContent = withComplianceFooter(`Hi {{first_name}},

Thanks for completing your audit.

Your results show a clear opportunity: ${formatMoney(report.totalSavingsAnnual)} in annual savings by automating ${report.topPriority.label.toLowerCase()} first.

Most founders and sales leaders are shocked when they see the actual number. For ${companyName}, the current estimate is:

Annual manual-work cost: ${formatMoney(report.totalAnnualCost)}
Weekly time wasted: ${report.totalWeeklyHours} hours
Potential time reclaimed: ${report.totalFreedHours} hours/week
Fastest priority: ${report.topPriority.label}
Timeline to full implementation: ${report.timeline}

If you want to discuss implementation strategy, I am happy to help:
${meetingUrl}

No pitch. Just a conversation about your specific opportunity.

Your full audit report is attached as a PDF.

Thanks & Regards,
AI SDR- Anutech Labs
Website: ${siteUrl}/`);

    let emailResult = await sendBrandedEmail({
      to: [
        {
          email: user.email,
          firstName,
          company: companyName,
          country: user.country,
          persona: "free_audit",
          target: report.topPriority.label
        }
      ],
      subject: emailSubject,
      content: auditEmailContent,
      cta: meetingUrl,
      attachments: [
        {
          filename: "anutechlabs-sales-automation-audit.pdf",
          contentBase64: pdfBase64,
          contentType: "application/pdf"
        }
      ]
    });

    if (emailResult.status === "failed") {
      emailResult = await sendBrandedEmail({
        to: [
          {
            email: user.email,
            firstName,
            company: companyName,
            country: user.country,
            persona: "free_audit",
            target: report.topPriority.label
          }
        ],
        subject: emailSubject,
        content: auditEmailContent,
        cta: meetingUrl
      });
    }

    await supabase.from("free_audit_requests").update({ email_status: emailResult.status }).eq("id", audit.id);
    await supabase.from("email_logs").insert({
      user_id: user.id,
      email_type: "free_audit_report",
      subject: emailSubject,
      status: emailResult.status,
      provider_message_id: emailResult.detail,
      sent_at: emailResult.sent ? new Date().toISOString() : null
    });

    await logTransaction({
      traceId,
      eventName: "free_audit_completed",
      route: "/api/free-audit",
      userId: user.id,
      email: user.email,
      status: "completed",
      metadata: { auditId: audit.id, emailStatus: emailResult.status, totalSavingsAnnual: report.totalSavingsAnnual }
    });

    return NextResponse.json({ ok: true, traceId, auditId: audit.id, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create free audit.";
    await logTransaction({ traceId, level: "error", eventName: "free_audit_failed", route: "/api/free-audit", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
