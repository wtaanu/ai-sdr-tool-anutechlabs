import { NextResponse } from "next/server";
import { agents } from "@/data/agents";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

type InterestEvent = {
  id: string;
  user_id: string;
  agent_id: number;
  agent_name: string;
  agent_slug: string;
  public_users?: {
    email?: string;
    full_name?: string;
    company?: string | null;
    country?: string | null;
  } | null;
};

async function processFollowups(request: Request) {
  const traceId = createTraceId("agent_interest_followups");
  const cronSecret = process.env.CRON_SECRET;
  const suppliedSecret = request.headers.get("x-cron-secret") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (cronSecret && suppliedSecret !== cronSecret) {
    await logTransaction({ traceId, level: "warn", eventName: "agent_interest_followup_unauthorized", route: "/api/agent-interest-followups", status: "blocked" });
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const now = new Date().toISOString();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://anutechlabs.company").replace(/\/$/, "");

    const { data, error } = await supabase
      .from("agent_interest_events")
      .select("id,user_id,agent_id,agent_name,agent_slug,public_users(email,full_name,company,country)")
      .eq("status", "opened")
      .lte("followup_due_at", now)
      .is("submitted_at", null)
      .is("followup_sent_at", null)
      .limit(50);

    if (error) {
      await logTransaction({ traceId, level: "error", eventName: "agent_interest_followup_lookup_failed", route: "/api/agent-interest-followups", status: "failed", detail: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = (data || []) as InterestEvent[];
    const results = [];

    for (const event of events) {
      const user = event.public_users;
      if (!user?.email) continue;

      const agent = agents.find((item) => item.id === event.agent_id);
      const agentName = agent?.name || event.agent_name;
      const agentUrl = `${siteUrl}/ai-agents/${agent?.slug || event.agent_slug}`;
      const freeAuditUrl = `${siteUrl}/free-audit`;
      const firstName = (user.full_name || "there").split(" ")[0];

      const content = withComplianceFooter(`Hi {{first_name}},

We saw you were exploring Agent - "${agentName}" on AI SDR by AnutechLabs.

That usually means one of two things: you are looking for a faster way to handle a repeated business process, or you want to understand whether this agent can fit your current tools and industry.

Here is the easiest next step:

1. Revisit the agent page and see the workflow, business value, and problems it solves:
${agentUrl}

2. Get your free AI Automation Audit. It takes around 2 minutes and shows which agent can save the most time or recover the most missed revenue for your business:
${freeAuditUrl}

If this agent is close to what you need but not exact, you can still submit a custom requirement. We can configure the workflow around your niche, region, language, CRM, email, calendar, website forms, LinkedIn, Instagram, WhatsApp, or internal tools.

To your growth,`);

      const htmlContent = `
        <p>Hi {{first_name}},</p>
        <p>We saw you were exploring <strong>Agent - "${agentName}"</strong> on <strong>AI SDR by AnutechLabs</strong>.</p>
        <p>That usually means one of two things: you are looking for a faster way to handle a repeated business process, or you want to understand whether this agent can fit your current tools and industry.</p>
        <p><strong>Here is the easiest next step:</strong></p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;border-collapse:collapse">
          <tr>
            <td style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#fff7ed">
              <strong style="color:#f97316">Review the agent workflow</strong><br />
              See the business value, expected workflow, and problems this agent solves.
              <p style="margin:14px 0 0"><a href="${agentUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:800;padding:11px 16px;border-radius:7px">Open ${agentName}</a></p>
            </td>
          </tr>
          <tr><td style="height:12px"></td></tr>
          <tr>
            <td style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
              <strong style="color:#f97316">Start your free AI Automation Audit</strong><br />
              It takes around 2 minutes and shows which agent can save the most time or recover the most missed revenue for your business.
              <p style="margin:14px 0 0"><a href="${freeAuditUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:800;padding:11px 16px;border-radius:7px">Get Free Audit</a></p>
            </td>
          </tr>
        </table>
        <p>If this agent is close to what you need but not exact, you can still submit a custom requirement. We can configure the workflow around your niche, region, language, CRM, email, calendar, website forms, LinkedIn, Instagram, WhatsApp, or internal tools.</p>
        <p>To your growth,</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="font-size:13px;color:#64748b">You can manage communication preferences here: <a href="${siteUrl}/unsubscribe" style="color:#f97316">unsubscribe</a></p>
        <p style="font-size:13px;color:#64748b">Privacy and data requests: <a href="${siteUrl}/privacy" style="color:#f97316">privacy policy</a></p>
      `;

      const emailResult = await sendBrandedEmail({
        to: [
          {
            email: user.email,
            firstName,
            company: user.company || "your business",
            country: user.country || "",
            persona: "agent_interest_followup",
            target: agentName
          }
        ],
        subject: `Still exploring ${agentName}? Your free audit is ready`,
        content,
        htmlContent,
        cta: freeAuditUrl
      });

      await supabase.from("agent_interest_events").update({
        status: emailResult.sent ? "followup_sent" : "followup_failed",
        followup_sent_at: emailResult.sent ? new Date().toISOString() : null,
        followup_status: emailResult.status,
        followup_detail: emailResult.detail
      }).eq("id", event.id);

      await supabase.from("email_logs").insert({
        user_id: event.user_id,
        email_type: "agent_interest_abandonment_followup",
        subject: `Still exploring ${agentName}? Your free audit is ready`,
        status: emailResult.status,
        provider_message_id: emailResult.detail,
        sent_at: emailResult.sent ? new Date().toISOString() : null
      });

      results.push({ eventId: event.id, email: user.email, status: emailResult.status });
    }

    await logTransaction({ traceId, eventName: "agent_interest_followups_completed", route: "/api/agent-interest-followups", status: "completed", metadata: { processed: results.length } });

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send agent interest follow-ups.";
    await logTransaction({ traceId, level: "error", eventName: "agent_interest_followups_failed", route: "/api/agent-interest-followups", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  return processFollowups(request);
}

export async function POST(request: Request) {
  return processFollowups(request);
}
