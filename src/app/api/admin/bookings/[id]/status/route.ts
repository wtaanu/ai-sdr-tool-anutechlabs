import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { bookingStatusSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = bookingStatusSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const updatePayload = {
      status: body.status,
      meeting_link: body.meetingLink || null
    };

    const { data: booking, error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select("id,user_id,enquiry_id,status,meeting_link")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: booking.user_id,
      enquiry_id: booking.enquiry_id,
      activity_type: "admin_booking_updated",
      details: {
        status: body.status,
        meetingLink: body.meetingLink || "",
        admin: session.email
      }
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update booking.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
