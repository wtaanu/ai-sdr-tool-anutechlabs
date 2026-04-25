import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { bookingSchema } from "@/lib/validators";
import { sendBrandedEmail, withComplianceFooter } from "@/lib/email";
import { createCalendarEvent } from "@/lib/calendar";

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
      return NextResponse.json({ error: "Enquiry not found for this verified profile." }, { status: 404 });
    }

    const preferredDate = new Date(body.preferredTime);
    if (Number.isNaN(preferredDate.getTime())) {
      return NextResponse.json({ error: "Please provide a valid preferred call time." }, { status: 400 });
    }

    const publicUsers = Array.isArray(enquiry.public_users) ? enquiry.public_users[0] : enquiry.public_users;
    const calendarResult = publicUsers?.email
      ? await createCalendarEvent({
          clientName: publicUsers.full_name || "AI SDR lead",
          clientEmail: publicUsers.email,
          industry: enquiry.industry,
          preferredTime: preferredDate.toISOString(),
          timezone: body.timezone,
          notes: body.notes || ""
        })
      : {
          created: false,
          meetingLink: "",
          eventId: null,
          detail: "Client email not found."
        };

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: body.userId,
        enquiry_id: body.enquiryId,
        preferred_time: preferredDate.toISOString(),
        timezone: body.timezone,
        meeting_link: calendarResult.meetingLink || null,
        calendar_event_id: calendarResult.eventId,
        status: calendarResult.created ? "scheduled" : "requested"
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
        timezone: booking.timezone,
        meetingLink: booking.meeting_link,
        calendarEventId: booking.calendar_event_id,
        calendarDetail: calendarResult.detail,
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

Your preferred call time has been saved:
${booking.preferred_time}
Timezone: ${booking.timezone}
${booking.meeting_link ? `Meeting link: ${booking.meeting_link}` : ""}

${booking.status === "scheduled" ? "A calendar invite has been created." : "We will confirm the calendar invite and meeting link after reviewing your requirement."}`)
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

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
    const ownerEmailResult = ownerEmail
      ? await sendBrandedEmail({
          to: [{ email: ownerEmail, firstName: "Owner", company: "AnutechLabs", persona: "owner_alert", target: "call booking" }],
          subject: `Call requested: ${enquiry.industry || "AI SDR enquiry"}`,
          content: `A lead requested a consultation call.

Name: ${publicUsers?.full_name || "Unknown"}
Email: ${publicUsers?.email || "Unknown"}
Industry: ${enquiry.industry || "Unknown"}
Preferred time: ${booking.preferred_time}
Timezone: ${booking.timezone}
Meeting link: ${booking.meeting_link || "Not created yet"}
Calendar status: ${calendarResult.detail}
Notes: ${body.notes || ""}`
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
