import { BookingStatusControl } from "@/components/AdminActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("id,preferred_time,timezone,status,meeting_link,enquiries(industry,public_users(full_name,email,country))")
    .order("created_at", { ascending: false });

  const bookings = (data || []) as any[];

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Call Requests</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => {
            const enquiry = Array.isArray(booking.enquiries) ? booking.enquiries[0] : booking.enquiries;
            const user = Array.isArray(enquiry?.public_users) ? enquiry.public_users[0] : enquiry?.public_users;
            return (
              <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <p className="font-black text-slate-950">{user?.full_name || "Unknown lead"}</p>
                <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
                <p className="mt-4 text-sm text-slate-700">{booking.preferred_time ? new Date(booking.preferred_time).toLocaleString() : "No time"}</p>
                <p className="mt-1 text-xs text-slate-500">{booking.timezone}</p>
                <div className="mt-4"><BookingStatusControl bookingId={booking.id} currentMeetingLink={booking.meeting_link} currentStatus={booking.status} /></div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
