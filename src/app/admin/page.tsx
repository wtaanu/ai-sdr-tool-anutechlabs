import { BarChart3, CalendarDays, Mail, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { agents } from "@/data/agents";
import { BookingStatusControl, LeadStatusControl, LogoutButton } from "@/components/AdminActions";
import { PublicVideoAdminForm } from "@/components/PublicVideoAdminForm";

const pipeline = ["New Lead", "Qualified", "Call Booked", "Call Done", "Proposal Sent", "Negotiation", "Won"];

export const metadata = {
  title: "Admin Dashboard | AI SDR by AnutechLabs"
};

export const dynamic = "force-dynamic";

type EnquiryRow = {
  id: string;
  selected_agent_ids: number[];
  custom_requirement: string | null;
  industry: string | null;
  business_type: string | null;
  automation_goal: string | null;
  ai_summary: string | null;
  ai_lead_score: number | null;
  ai_priority: string | null;
  status: string;
  created_at: string;
  public_users: {
    full_name: string;
    email: string;
    mobile: string;
    country: string;
    company: string | null;
  } | null;
};

type BookingRow = {
  id: string;
  preferred_time: string | null;
  timezone: string | null;
  status: string;
  meeting_link: string | null;
  enquiries: {
    industry: string | null;
    public_users: {
      full_name: string;
      email: string;
      country: string;
    } | null;
  } | null;
};

type SupabaseEnquiryRow = Omit<EnquiryRow, "public_users"> & {
  public_users:
    | EnquiryRow["public_users"]
    | NonNullable<EnquiryRow["public_users"]>[]
    | null;
};

async function getDashboardData() {
  try {
    const supabase = getSupabaseAdminClient();
    const [
      verifiedUsers,
      enquiries,
      bookings,
      emails,
      openedInterests,
      recentEnquiries,
      consentLogs,
      recentBookings,
      dataRequests,
      publicVideos
    ] = await Promise.all([
      supabase.from("public_users").select("id", { count: "exact", head: true }).eq("is_email_verified", true),
      supabase.from("enquiries").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("email_logs").select("id", { count: "exact", head: true }).in("status", ["draft", "queued"]),
      supabase.from("agent_interest_events").select("id", { count: "exact", head: true }).eq("status", "opened"),
      supabase
        .from("enquiries")
        .select("id,selected_agent_ids,custom_requirement,industry,business_type,automation_goal,ai_summary,ai_lead_score,ai_priority,status,created_at,public_users(full_name,email,mobile,country,company)")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("consent_logs").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id,preferred_time,timezone,status,meeting_link,enquiries(industry,public_users(full_name,email,country))")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("data_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("learning_videos").select("id,title,tag,youtube_url,created_at").eq("is_published", true).order("created_at", { ascending: false }).limit(5)
    ]);

    const normalizedRecentEnquiries = ((recentEnquiries.data || []) as unknown as SupabaseEnquiryRow[]).map((enquiry) => ({
      ...enquiry,
      public_users: Array.isArray(enquiry.public_users) ? enquiry.public_users[0] || null : enquiry.public_users
    }));

    return {
      counts: {
        verifiedUsers: verifiedUsers.count || 0,
        enquiries: enquiries.count || 0,
        bookings: bookings.count || 0,
        emails: emails.count || 0,
        openedInterests: openedInterests.count || 0,
        consentLogs: consentLogs.count || 0,
        dataRequests: dataRequests.count || 0
      },
      recentEnquiries: normalizedRecentEnquiries,
      recentBookings: (recentBookings.data || []) as unknown as BookingRow[],
      publicVideos: publicVideos.data || [],
      error: recentEnquiries.error?.message
    };
  } catch (error) {
    return {
      counts: {
        verifiedUsers: 0,
        enquiries: 0,
        bookings: 0,
        emails: 0,
        openedInterests: 0,
        consentLogs: 0,
        dataRequests: 0
      },
      recentEnquiries: [] as EnquiryRow[],
      recentBookings: [] as BookingRow[],
      publicVideos: [],
      error: error instanceof Error ? error.message : "Dashboard data is unavailable."
    };
  }
}

function getAgentNames(ids: number[]) {
  if (!ids?.length) {
    return "Custom / not selected";
  }

  return ids
    .map((id) => agents.find((agent) => agent.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

export default async function AdminDashboardPage() {
  const dashboard = await getDashboardData();
  const stats = [
    { label: "Verified users", value: String(dashboard.counts.verifiedUsers), note: "Profiles after OTP", icon: UsersRound },
    { label: "New enquiries", value: String(dashboard.counts.enquiries), note: "Website and custom requests", icon: Sparkles },
    { label: "Calls booked", value: String(dashboard.counts.bookings), note: "Consultations scheduled", icon: CalendarDays },
    { label: "Emails queued", value: String(dashboard.counts.emails), note: "Drafts and follow-ups", icon: Mail },
    { label: "Opened interest", value: String(dashboard.counts.openedInterests), note: "Needs follow-back", icon: Sparkles }
  ];

  return (
    <main className="min-h-screen bg-mist">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <a className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 font-bold text-orange-400">AI</span>
            <span>
              <span className="block text-sm font-bold text-slate-950">AI SDR by AnutechLabs</span>
              <span className="block text-xs text-slate-500">Owner control room</span>
            </span>
          </a>
          <nav className="mt-10 space-y-1 text-sm font-semibold text-slate-700">
            {[
              ["Overview", "/admin"],
              ["Client Acquisition", "/admin/client-acquisition"],
              ["Free Audits", "/admin/free-audits"],
              ["Public Videos", "/videos"],
              ["Public Blogs", "/blogs"],
              ["Pipeline", "/admin/pipeline"],
              ["Opened Interest", "/admin/interest-events"],
              ["Calls", "/admin/calls"],
              ["Emails", "/admin/emails"],
              ["Agents", "/admin/agents"],
              ["Custom Requests", "/admin/custom-requests"],
              ["Analytics", "/admin/analytics"],
              ["Compliance", "/admin/compliance"],
              ["Settings", "/admin/settings"]
            ].map(([item, href]) => (
              <a key={item} className="block rounded-md px-3 py-2 hover:bg-orange-50 hover:text-orange-700" href={href}>
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">private dashboard</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">AI SDR command center</h1>
              <p className="mt-2 text-sm text-slate-600">Every verified signup, enquiry, call booking, and follow-up will appear here.</p>
            </div>
            <LogoutButton />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <stat.icon className="text-orange-500" size={22} />
                <p className="mt-4 text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="mt-2 text-4xl font-black text-slate-950">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Lead pipeline</h2>
                  <p className="mt-1 text-sm text-slate-500">Open the pipeline page to move leads between stages.</p>
                </div>
                <BarChart3 className="text-orange-500" size={24} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {pipeline.map((stage) => (
                  <div key={stage} className="min-h-28 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-800">{stage}</p>
                    <p className="mt-3 text-xs text-slate-500">No leads yet</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <ShieldCheck className="text-orange-500" size={24} />
              <h2 className="mt-4 text-xl font-black text-slate-950">Compliance center</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>Consent logs: {dashboard.counts.consentLogs}</p>
                <p>Unsubscribed users: 0</p>
                <p>Data requests: {dashboard.counts.dataRequests}</p>
                <p>Privacy policy version: draft</p>
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <PublicVideoAdminForm />
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black text-slate-950">Published videos</h2>
              <div className="mt-5 space-y-3">
                {dashboard.publicVideos.map((video: any) => (
                  <a key={video.id} className="block rounded-md bg-slate-50 p-4 hover:bg-orange-50" href="/videos" target="_blank">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600">{video.tag || "Video"}</p>
                    <h3 className="mt-1 font-black text-slate-950">{video.title}</h3>
                    <p className="mt-1 break-all text-xs text-slate-500">{video.youtube_url}</p>
                  </a>
                ))}
                {dashboard.publicVideos.length === 0 && <p className="text-sm text-slate-500">No public videos published yet.</p>}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Recent call requests</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dashboard.recentBookings.map((booking) => (
                <article key={booking.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{booking.enquiries?.public_users?.full_name || "Unknown lead"}</p>
                  <p className="mt-1 text-xs text-slate-500">{booking.enquiries?.public_users?.email}</p>
                  <p className="mt-3 text-sm text-slate-700">{booking.preferred_time ? new Date(booking.preferred_time).toLocaleString() : "No time"}</p>
                  <p className="mt-1 text-xs text-slate-500">{booking.timezone}</p>
                  <div className="mt-3">
                    <BookingStatusControl bookingId={booking.id} currentMeetingLink={booking.meeting_link} currentStatus={booking.status} />
                  </div>
                </article>
              ))}
              {!dashboard.recentBookings.length && (
                <p className="text-sm text-slate-500">No call requests yet.</p>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black text-slate-950">Lead inbox</h2>
                <p className="mt-1 text-sm text-slate-500">Latest verified enquiries from the website and agent catalogue.</p>
              </div>
              {dashboard.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{dashboard.error}</p>}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <th className="py-3 pr-4">Lead</th>
                    <th className="py-3 pr-4">Agent</th>
                    <th className="py-3 pr-4">Industry</th>
                    <th className="py-3 pr-4">Goal</th>
                    <th className="py-3 pr-4">Score</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="border-b border-slate-100 align-top">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-950">{enquiry.public_users?.full_name || "Unknown"}</p>
                        <p className="mt-1 text-xs text-slate-500">{enquiry.public_users?.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{enquiry.public_users?.country} {enquiry.public_users?.company ? `- ${enquiry.public_users.company}` : ""}</p>
                      </td>
                      <td className="max-w-[220px] py-4 pr-4 text-slate-700">{getAgentNames(enquiry.selected_agent_ids)}</td>
                      <td className="py-4 pr-4 text-slate-700">{enquiry.industry || "-"}</td>
                      <td className="max-w-[260px] py-4 pr-4 text-slate-600">{enquiry.automation_goal || enquiry.custom_requirement || "-"}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{enquiry.ai_lead_score || 0}</span>
                        <p className="mt-2 text-xs text-slate-500">{enquiry.ai_priority || "Review"}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <LeadStatusControl currentStatus={enquiry.status} enquiryId={enquiry.id} />
                      </td>
                      <td className="py-4 pr-4">
                        <a className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white" href={`/admin/leads/${enquiry.id}`}>
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                  {!dashboard.recentEnquiries.length && (
                    <tr>
                      <td className="py-8 text-center text-slate-500" colSpan={7}>
                        No enquiries yet. Once a verified visitor submits interest, it will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
