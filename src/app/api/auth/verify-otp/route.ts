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
      subject: "Your AI SDR by AnutechLabs access is verified",
      content: withComplianceFooter(`Hi {{first_name}},

Your email is verified and your AI SDR by AnutechLabs profile is ready.

You can now explore AI agents, submit an interest request, or describe a custom automation workflow.`)
    });

    await supabase.from("email_logs").insert({
      user_id: user.id,
      email_type: "verification_success",
      subject: "Your AI SDR by AnutechLabs access is verified",
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
