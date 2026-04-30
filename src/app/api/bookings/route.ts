import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { bookingSchema } from "@/lib/validators";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = bookingSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .select("id,user_id,industry,status,public_users(full_name,email,country,company)")
      .eq("id", body.enquiryId)
      .eq("user_id", body.userId)
      .maybeSingle();

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found for this profile." }, { status: 404 });
    }

    const preferredDate = new Date(body.preferredTime);
    if (Number.isNaN(preferredDate.getTime())) {
      return NextResponse.json({ error: "Please provide a valid preferred call time." }, { status: 400 });
    }

    const publicUsers = Array.isArray(enquiry.public_users) ? enquiry.public_users[0] : enquiry.public_users;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: body.userId,
        enquiry_id: body.enquiryId,
        preferred_time: preferredDate.toISOString(),
        timezone: body.country,
        meeting_link: null,
        calendar_event_id: null,
        status: "requested"
      })
      .select("id,preferred_time,timezone,status,meeting_link,calendar_event_id")
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    await supabase.from("enquiries").update({ status: "Call Booked" }).eq("id", body.enquiryId);
    await supabase.from("activity_timeline").insert({
      user_id: body.userId,
      enquiry_id: body.enquiryId,
      activity_type: "call_requested",
      details: {
        bookingId: booking.id,
        preferredTime: booking.preferred_time,
        country: body.country,
        notes: body.notes || ""
      }
    });

    const clientEmailResult = publicUsers?.email
      ? await sendBrandedEmail({
          to: [
            {
              email: publicUsers.email,
              firstName: publicUsers.full_name?.split(" ")[0],
              company: publicUsers.company || "your business",
              country: publicUsers.country,
              persona: "call_booking_request",
              target: "AI SDR consultation"
            }
          ],
          subject: "Your AI SDR consultation request is received",
          content: withComplianceFooter(`Hi {{first_name}},

Thank you for requesting a consultation with AI SDR by AnutechLabs.

Your call request has been initiated successfully.

Requested time: ${booking.preferred_time}
Country: ${body.country}
Requirement: ${enquiry.industry || "AI SDR automation"}
Notes: ${body.notes || "Not added"}

Our team will review your requirement and reply on this email with the confirmed meeting link.`)
        })
      : { status: "draft", sent: false, detail: "Client email not found." };

    await supabase.from("email_logs").insert({
      user_id: body.userId,
      enquiry_id: body.enquiryId,
      email_type: "client_call_booking_confirmation",
      subject: "Your AI SDR consultation request is received",
      status: clientEmailResult.status,
      provider_message_id: clientEmailResult.detail,
      sent_at: clientEmailResult.sent ? new Date().toISOString() : null
    });

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || "wtaanu@gmail.com";
    const ownerEmailResult = ownerEmail
      ? await sendBrandedEmail({
          to: [{ email: ownerEmail, firstName: "Owner", company: "AnutechLabs", persona: "owner_alert", target: "call booking" }],
          subject: `Call requested: ${enquiry.industry || "AI SDR enquiry"}`,
          content: withComplianceFooter(`Hi Anuragini,

A lead requested a consultation call from AI SDR by AnutechLabs.

Name: ${publicUsers?.full_name || "Unknown"}
Email: ${publicUsers?.email || "Unknown"}
Company: ${publicUsers?.company || "Unknown"}
Country: ${body.country}
Industry: ${enquiry.industry || "Unknown"}
Preferred time: ${booking.preferred_time}
Notes: ${body.notes || "Not added"}

Please reply or send the meeting link manually after reviewing the requirement.`)
        })
      : { status: "draft", sent: false, detail: "OWNER_NOTIFICATION_EMAIL is not configured." };

    await supabase.from("email_logs").insert({
      user_id: body.userId,
      enquiry_id: body.enquiryId,
      email_type: "owner_call_booking_notification",
      subject: `Call requested: ${enquiry.industry || "AI SDR enquiry"}`,
      status: ownerEmailResult.status,
      provider_message_id: ownerEmailResult.detail,
      sent_at: ownerEmailResult.sent ? new Date().toISOString() : null
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to request booking.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
