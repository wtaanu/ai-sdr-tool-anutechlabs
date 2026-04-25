import { NextResponse } from "next/server";
import { createOtp, hashOtp } from "@/lib/otp";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { signupSchema } from "@/lib/validators";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("otp_request");
  try {
    const body = signupSchema.parse(await request.json());
    await logTransaction({ traceId, eventName: "otp_request_started", route: "/api/auth/request-otp", email: body.email, status: "started" });
    const supabase = getSupabaseAdminClient();
    const otp = createOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase.from("otp_requests").insert({
      email: body.email.toLowerCase().trim(),
      otp_hash: hashOtp(body.email, otp),
      expires_at: expiresAt
    });

    if (error) {
      await logTransaction({ traceId, level: "error", eventName: "otp_request_db_failed", route: "/api/auth/request-otp", email: body.email, status: "failed", detail: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emailResult = await sendBrandedEmail({
      to: [
        {
          email: body.email,
          firstName: body.fullName.split(" ")[0],
          company: body.company || "your business",
          country: body.country,
          persona: "verified_website_visitor",
          target: "AI SDR access"
        }
      ],
      subject: "Your AI SDR by AnutechLabs verification code",
      content: withComplianceFooter(`Hi {{first_name}},

Your 6-digit verification code is:

${otp}

This code expires in 10 minutes. Once verified, your profile will be created and the AI agent catalogue will unlock.`)
    });

    await supabase.from("email_logs").insert({
      email_type: "otp_verification",
      subject: "Your AI SDR by AnutechLabs verification code",
      status: emailResult.status,
      provider_message_id: emailResult.detail,
      sent_at: emailResult.sent ? new Date().toISOString() : null
    });

    await logTransaction({
      traceId,
      eventName: "otp_request_completed",
      route: "/api/auth/request-otp",
      email: body.email,
      status: emailResult.status,
      detail: emailResult.detail
    });

    return NextResponse.json({
      ok: true,
      traceId,
      message: emailResult.sent ? "OTP sent to your email." : "OTP created. Email delivery is being processed."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to request OTP.";
    await logTransaction({ traceId, level: "error", eventName: "otp_request_failed", route: "/api/auth/request-otp", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
