import { notFound } from "next/navigation";
import { agents } from "@/data/agents";
import { BookingStatusControl, LeadStatusControl } from "@/components/AdminActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

function agentNames(ids: number[]) {
  if (!ids?.length) return "Custom / not selected";
  return ids.map((id) => agents.find((agent) => agent.id === id)?.name).filter(Boolean).join(", ");
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const [{ data: enquiry }, { data: timeline }, { data: bookings }, { data: emails }] = await Promise.all([
    supabase
      .from("enquiries")
      .select("*,public_users(full_name,email,mobile,country,company,website,created_at)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("activity_timeline").select("*").eq("enquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").eq("enquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("email_logs").select("*").eq("enquiry_id", id).order("created_at", { ascending: false })
  ]);

  if (!enquiry) {
    notFound();
  }

  const user = Array.isArray(enquiry.public_users) ? enquiry.public_users[0] : enquiry.public_users;

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">lead detail</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950">{user?.full_name || "Unknown lead"}</h1>
              <p className="mt-2 text-sm text-slate-600">{user?.email} · {user?.mobile} · {user?.country}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-md bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase text-orange-700">Score</p>
                  <p className="mt-2 text-3xl font-black text-orange-700">{enquiry.ai_lead_score || 0}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Priority</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{enquiry.ai_priority || "Review"}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                  <div className="mt-2"><LeadStatusControl currentStatus={enquiry.status} enquiryId={enquiry.id} /></div>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-black text-slate-950">Requirement</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <p><strong>Agent:</strong> {agentNames(enquiry.selected_agent_ids)}</p>
                <p><strong>Industry:</strong> {enquiry.industry || "-"}</p>
                <p><strong>Business type:</strong> {enquiry.business_type || "-"}</p>
                <p><strong>Goal:</strong> {enquiry.automation_goal || "-"}</p>
                <p><strong>Problem:</strong> {enquiry.current_problem || "-"}</p>
                <p><strong>Custom request:</strong> {enquiry.custom_requirement || "-"}</p>
                <p><strong>Timeline:</strong> {enquiry.timeline || "-"}</p>
                <p><strong>Budget:</strong> {enquiry.budget_range || "-"}</p>
                <p><strong>Remarks:</strong> {enquiry.remarks || "-"}</p>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-black text-slate-950">AI summary</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">{enquiry.ai_summary || "No summary yet."}</p>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-black text-slate-950">Bookings</h2>
              <div className="mt-4 space-y-4">
                {(bookings || []).map((booking) => (
                  <div key={booking.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-950">{booking.preferred_time ? new Date(booking.preferred_time).toLocaleString() : "No time"}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.timezone}</p>
                    <div className="mt-3"><BookingStatusControl bookingId={booking.id} currentMeetingLink={booking.meeting_link} currentStatus={booking.status} /></div>
                  </div>
                ))}
                {!bookings?.length && <p className="text-sm text-slate-500">No booking requests.</p>}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-black text-slate-950">Email log</h2>
              <div className="mt-4 space-y-3">
                {(emails || []).map((email) => (
                  <div key={email.id} className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="font-bold text-slate-900">{email.email_type}</p>
                    <p>{email.subject}</p>
                    <p>{email.status}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-black text-slate-950">Timeline</h2>
              <div className="mt-4 space-y-3">
                {(timeline || []).map((item) => (
                  <div key={item.id} className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="font-bold text-slate-900">{item.activity_type}</p>
                    <p>{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
