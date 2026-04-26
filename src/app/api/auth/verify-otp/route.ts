import { NextResponse } from "next/server";
import { hashOtp } from "@/lib/otp";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { otpVerifySchema } from "@/lib/validators";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("otp_verify");
  try {
    const body = otpVerifySchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();
    await logTransaction({ traceId, eventName: "otp_verify_started", route: "/api/auth/verify-otp", email, status: "started" });
    const supabase = getSupabaseAdminClient();

    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("email", email)
      .is("verified_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      await logTransaction({ traceId, level: "warn", eventName: "otp_verify_not_found", route: "/api/auth/verify-otp", email, status: "failed" });
      return NextResponse.json({ error: "OTP expired or not found." }, { status: 400 });
    }

    if (otpRecord.attempts >= 5) {
      await logTransaction({ traceId, level: "warn", eventName: "otp_verify_too_many_attempts", route: "/api/auth/verify-otp", email, status: "blocked" });
      return NextResponse.json({ error: "Too many attempts. Request a new OTP." }, { status: 429 });
    }

    const isValid = otpRecord.otp_hash === hashOtp(email, body.otp);
    if (!isValid) {
      await supabase.from("otp_requests").update({ attempts: otpRecord.attempts + 1 }).eq("id", otpRecord.id);
      await logTransaction({ traceId, level: "warn", eventName: "otp_verify_invalid", route: "/api/auth/verify-otp", email, status: "failed", metadata: { attempts: otpRecord.attempts + 1 } });
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("public_users")
      .upsert(
        {
          full_name: body.fullName,
          email,
          mobile: body.mobile,
          country: body.country,
          company: body.company || null,
          website: body.website || null,
          source: body.source || "website",
          is_email_verified: true
        },
        { onConflict: "email" }
      )
      .select("id,email,full_name")
      .single();

    if (userError) {
      await logTransaction({ traceId, level: "error", eventName: "otp_verify_user_upsert_failed", route: "/api/auth/verify-otp", email, status: "failed", detail: userError.message });
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    await supabase.from("otp_requests").update({ verified_at: new Date().toISOString() }).eq("id", otpRecord.id);
    await supabase.from("consent_logs").insert({
      user_id: user.id,
      consent_type: "marketing_and_terms",
      status: "granted",
      country: body.country,
      source_url: body.source || "website"
    });
    await supabase.from("activity_timeline").insert({
      user_id: user.id,
      activity_type: "email_verified",
      details: { source: body.source || "website" }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anutechlabs.company";
    const freeAuditUrl = `${siteUrl.replace(/\/$/, "")}/free-audit`;
    const welcomeSubject = "Welcome to AI SDR by AnutechLabs | Your AI Agent is ready to configure";
    const welcomeText = withComplianceFooter(`Hi {{first_name}},

Welcome to AI SDR by AnutechLabs. You've joined a global network of businesses using autonomous agents to handle the heavy lifting of lead generation and client acquisition.

Your access to the AI Agent Hub is now active. Here is how to get started:

Deploy a Pre-Built Agent: Choose from our gallery of 50+ specialized agents for Real Estate, Legal, SaaS, Social, Finance, Compliance, and more.

Custom Build: Use our Workflow Architect to describe a unique automation, and we'll build the logic for you.

Safety First: Your data is protected under our global privacy-first framework, including GDPR, CCPA, and DPDP aligned practices.

What's next?
I recommend starting with your Free AI Automation Audit. It takes 2 minutes and identifies exactly which agent will save you the most hours this week.

Click here for FREE Audit:
${freeAuditUrl}

To your growth,`);
    const welcomeHtml = `
      <p>Hi {{first_name}},</p>
      <p>Welcome to <strong>AI SDR by AnutechLabs</strong>. You've joined a global network of businesses using autonomous agents to handle the heavy lifting of lead generation and client acquisition.</p>
      <p>Your access to the <strong>AI Agent Hub</strong> is now active. Here is how to get started:</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;border-collapse:collapse">
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
            <strong style="color:#f97316">Deploy a Pre-Built Agent:</strong><br />
            Choose from our gallery of 50+ specialized agents for Real Estate, Legal, SaaS, Social, Finance, Compliance, and more.
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
            <strong style="color:#f97316">Custom Build:</strong><br />
            Use our Workflow Architect to describe a unique automation, and we'll build the logic for you.
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0">
            <strong style="color:#f97316">Safety First:</strong><br />
            Your data is protected under our global privacy-first framework, including GDPR, CCPA, and DPDP aligned practices.
          </td>
        </tr>
      </table>
      <p><strong>What's next?</strong><br />I recommend starting with your Free AI Automation Audit. It takes 2 minutes and identifies exactly which agent will save you the most hours this week.</p>
      <p style="margin:24px 0">
        <a href="${freeAuditUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:8px">Get your FREE Audit</a>
      </p>
      <p>Click here for FREE Audit: <a href="${freeAuditUrl}" style="color:#f97316;font-weight:700">${freeAuditUrl}</a></p>
      <p>To your growth,</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:13px;color:#64748b">You can manage communication preferences here: <a href="${siteUrl.replace(/\/$/, "")}/unsubscribe" style="color:#f97316">unsubscribe</a></p>
      <p style="font-size:13px;color:#64748b">Privacy and data requests: <a href="${siteUrl.replace(/\/$/, "")}/privacy" style="color:#f97316">privacy policy</a></p>
    `;

    const emailResult = await sendBrandedEmail({
      to: [
        {
          email,
          firstName: body.fullName.split(" ")[0],
          company: body.company || "your business",
          country: body.country,
          persona: "verified_website_visitor",
          target: "AI agent catalogue"
        }
      ],
      subject: welcomeSubject,
      content: welcomeText,
      htmlContent: welcomeHtml,
      cta: freeAuditUrl
    });

    await supabase.from("email_logs").insert({
      user_id: user.id,
      email_type: "verification_success",
      subject: welcomeSubject,
      status: emailResult.status,
      provider_message_id: emailResult.detail,
      sent_at: emailResult.sent ? new Date().toISOString() : null
    });

    await logTransaction({ traceId, eventName: "otp_verify_completed", route: "/api/auth/verify-otp", email, userId: user.id, status: "completed" });

    return NextResponse.json({ ok: true, traceId, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify OTP.";
    await logTransaction({ traceId, level: "error", eventName: "otp_verify_failed", route: "/api/auth/verify-otp", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
