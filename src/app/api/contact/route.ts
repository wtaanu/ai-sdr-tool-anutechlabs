import { NextResponse } from "next/server";
import { sendBrandedEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createTraceId, logTransaction } from "@/lib/transactionLog";
import { contactQuerySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const traceId = createTraceId("contact_query");

  try {
    const body = contactQuerySchema.parse(await request.json());
    const ownerEmail = "wtaanu@gmail.com";

    await logTransaction({
      traceId,
      eventName: "contact_query_started",
      route: "/api/contact",
      email: body.email,
      status: "started"
    });

    const emailResult = await sendBrandedEmail({
      to: [
        {
          email: ownerEmail,
          firstName: "Anuragini",
          company: "AnutechLabs",
          persona: "contact_query",
          target: "website enquiry"
        }
      ],
      subject: `New website query from ${body.email}`,
      content: `Hi {{first_name}},

New contact query received from AI SDR by AnutechLabs.

User email: ${body.email}
Page: ${body.pageUrl || "not captured"}

Query:
${body.query}`
    });

    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from("email_logs").insert({
        email_type: "website_contact_query",
        subject: `New website query from ${body.email}`,
        status: emailResult.status,
        provider_message_id: emailResult.detail,
        sent_at: emailResult.sent ? new Date().toISOString() : null
      });
    } catch {
      // Email is the primary action; logging should not block user contact.
    }

    await logTransaction({
      traceId,
      eventName: "contact_query_completed",
      route: "/api/contact",
      email: body.email,
      status: emailResult.status,
      metadata: { sent: emailResult.sent }
    });

    if (!emailResult.sent) {
      return NextResponse.json({ error: emailResult.detail || "Unable to send contact query." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, traceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send contact query.";
    await logTransaction({ traceId, level: "error", eventName: "contact_query_failed", route: "/api/contact", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
