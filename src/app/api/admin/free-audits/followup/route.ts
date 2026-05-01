import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { freeAuditFollowupSchema } from "@/lib/validators";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

const copyByType = {
  value_reminder: {
    subject: "Your sales automation audit is still worth reviewing",
    body: "I wanted to share one practical point from your audit: the fastest win is not replacing your team, it is removing the repetitive work that slows them down. If you want, we can look at your workflow and identify the first automation to implement."
  },
  roadmap_help: {
    subject: "Need help turning your audit into a 90-day roadmap?",
    body: "Your audit already shows where time is leaking. The useful next step is choosing what to fix first, what to ignore for now, and what should be automated only after the basics are stable."
  },
  strategy_call: {
    subject: "Quick strategy call for your audit results",
    body: "If you want a second opinion, I can walk through your audit and validate the savings with your actual workflow. No pressure or pitch, just a practical call about the opportunity."
  },
  case_study: {
    subject: "How teams turn audit findings into booked calls",
    body: "The best audit outcomes usually come from one clear automation: lead capture, follow-up, CRM updates, or verification. Once that first system is live, every new lead becomes easier to track and convert."
  }
};

function getUser(row: any) {
  return Array.isArray(row.public_users) ? row.public_users[0] || null : row.public_users;
}

export async function POST(request: Request) {
  const traceId = createTraceId("free_audit_admin_followup");

  try {
    const cookieStore = await cookies();
    const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = freeAuditFollowupSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    const { data: audit, error } = await supabase
      .from("free_audit_requests")
      .select("id,user_id,roi_potential,report_json,created_at,public_users(full_name,email,company,country)")
      .eq("id", body.auditId)
      .maybeSingle();

    if (error || !audit) {
      return NextResponse.json({ error: error?.message || "Audit not found." }, { status: 404 });
    }

    const user = getUser(audit);
    if (!user?.email) {
      return NextResponse.json({ error: "Audit user email not found." }, { status: 400 });
    }

    const template = copyByType[body.followupType];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anutechlabs.company";
    const meetingUrl = process.env.DEFAULT_MEETING_URL || `${siteUrl}/#contact-us`;
    const reportJson = audit.report_json && typeof audit.report_json === "object" ? audit.report_json as Record<string, any> : {};
    const savings = reportJson.totalSavingsAnnual ? `$${Number(reportJson.totalSavingsAnnual).toLocaleString("en-US")}` : audit.roi_potential || "your automation opportunity";
    const topPriority = reportJson.topPriority?.label || "your highest ROI sales workflow";

    const content = withComplianceFooter(`Hi {{first_name}},

${template.body}

From your audit:
Estimated opportunity: ${savings}
Fastest priority: ${topPriority}

Free audit link:
${siteUrl}/free-audit

Strategy call:
${meetingUrl}

Thanks & Regards,
AI SDR- Anutech Labs
Website: ${siteUrl}/`);

    const emailResult = await sendBrandedEmail({
      to: [{ email: user.email, firstName: user.full_name?.split(" ")[0], company: user.company || "your business", country: user.country, persona: "free_audit_followup", target: topPriority }],
      subject: template.subject,
      content,
      cta: meetingUrl
    });

    await supabase.from("email_logs").insert({
      user_id: audit.user_id,
      email_type: `free_audit_followup_${body.followupType}`,
      subject: template.subject,
      status: emailResult.status,
      provider_message_id: emailResult.detail,
      sent_at: emailResult.sent ? new Date().toISOString() : null
    });

    await supabase.from("activity_timeline").insert({
      user_id: audit.user_id,
      activity_type: "free_audit_admin_followup_sent",
      details: {
        auditId: audit.id,
        followupType: body.followupType,
        emailStatus: emailResult.status,
        admin: session.email
      }
    });

    await logTransaction({ traceId, eventName: "free_audit_admin_followup_completed", route: "/api/admin/free-audits/followup", email: session.email, userId: audit.user_id, status: "completed", metadata: { auditId: audit.id, followupType: body.followupType, emailStatus: emailResult.status } });

    return NextResponse.json({ ok: true, status: emailResult.status, detail: emailResult.detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send free audit follow-up.";
    await logTransaction({ traceId, level: "error", eventName: "free_audit_admin_followup_failed", route: "/api/admin/free-audits/followup", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
