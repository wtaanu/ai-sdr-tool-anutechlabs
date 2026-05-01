import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

type InterestEventRow = {
  id: string;
  user_id: string;
  enquiry_id: string | null;
  agent_id: number;
  agent_name: string;
  agent_slug: string;
  page_url: string | null;
  status: string;
  followup_due_at: string | null;
  submitted_at: string | null;
  followup_sent_at: string | null;
  followup_status: string | null;
  followup_detail: string | null;
  created_at: string;
  public_users:
    | {
        full_name: string;
        email: string;
        mobile: string;
        country: string;
        company: string | null;
      }
    | Array<{
        full_name: string;
        email: string;
        mobile: string;
        country: string;
        company: string | null;
      }>
    | null;
};

type ReplyRow = {
  from_email: string | null;
  subject: string | null;
  reply_category: string | null;
  reply_sentiment: string | null;
  received_at: string | null;
};

function getUser(event: InterestEventRow) {
  return Array.isArray(event.public_users) ? event.public_users[0] || null : event.public_users;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

function statusClass(status: string) {
  if (status === "submitted") return "bg-green-50 text-green-700";
  if (status === "followup_sent") return "bg-orange-50 text-orange-700";
  if (status === "followup_failed") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default async function InterestEventsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_interest_events")
    .select("id,user_id,enquiry_id,agent_id,agent_name,agent_slug,page_url,status,followup_due_at,submitted_at,followup_sent_at,followup_status,followup_detail,created_at,public_users(full_name,email,mobile,country,company)")
    .order("created_at", { ascending: false })
    .limit(200);

  const events = (data || []) as unknown as InterestEventRow[];
  const emails = Array.from(new Set(events.map((event) => getUser(event)?.email).filter(Boolean))) as string[];
  const { data: replies } = emails.length
    ? await supabase
        .from("sales_inbox_replies")
        .select("from_email,subject,reply_category,reply_sentiment,received_at")
        .in("from_email", emails)
        .order("received_at", { ascending: false })
    : { data: [] };

  const latestReplyByEmail = new Map<string, ReplyRow>();
  for (const reply of (replies || []) as ReplyRow[]) {
    if (reply.from_email && !latestReplyByEmail.has(reply.from_email)) {
      latestReplyByEmail.set(reply.from_email, reply);
    }
  }

  const openedCount = events.filter((event) => event.status === "opened").length;
  const submittedCount = events.filter((event) => event.status === "submitted").length;
  const followupSentCount = events.filter((event) => event.status === "followup_sent").length;
  const replyCount = events.filter((event) => {
    const user = getUser(event);
    return user?.email ? latestReplyByEmail.has(user.email) : false;
  }).length;

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-950">Opened Interest Follow-ups</h1>
            <p className="mt-2 text-sm text-slate-600">
              Visitors who opened an agent interest form, whether they submitted, and whether the 24-hour follow-back email was sent.
            </p>
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Still open", openedCount],
            ["Submitted", submittedCount],
            ["Follow-ups sent", followupSentCount],
            ["Replies matched", replyCount]
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="p-4">Visitor</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Status</th>
                <th className="p-4">Opened</th>
                <th className="p-4">Follow-up Due</th>
                <th className="p-4">Email Sent</th>
                <th className="p-4">Email Detail</th>
                <th className="p-4">Reply</th>
                <th className="p-4">Open</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const user = getUser(event);
                const reply = user?.email ? latestReplyByEmail.get(user.email) : null;

                return (
                  <tr key={event.id} className="border-b border-slate-100 align-top">
                    <td className="p-4">
                      <p className="font-bold text-slate-950">{user?.full_name || "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{user?.email || "-"}</p>
                      <p className="mt-1 text-xs text-slate-500">{user?.mobile || "-"} {user?.country ? `- ${user.country}` : ""}</p>
                      {user?.company && <p className="mt-1 text-xs text-slate-500">{user.company}</p>}
                    </td>
                    <td className="max-w-[240px] p-4">
                      <p className="font-bold text-slate-950">{event.agent_name}</p>
                      <a className="mt-2 inline-block text-xs font-bold text-orange-600" href={`/ai-agents/${event.agent_slug}`} target="_blank">
                        View agent page
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(event.status)}`}>{event.status}</span>
                      {event.submitted_at && <p className="mt-2 text-xs text-slate-500">Submitted: {formatDate(event.submitted_at)}</p>}
                    </td>
                    <td className="p-4 text-xs text-slate-500">{formatDate(event.created_at)}</td>
                    <td className="p-4 text-xs text-slate-500">{formatDate(event.followup_due_at)}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{event.followup_status || "not_sent"}</span>
                      <p className="mt-2 text-xs text-slate-500">{formatDate(event.followup_sent_at)}</p>
                    </td>
                    <td className="max-w-[240px] p-4 text-xs text-slate-500">{event.followup_detail || "-"}</td>
                    <td className="max-w-[220px] p-4 text-xs text-slate-600">
                      {reply ? (
                        <>
                          <p className="font-bold text-slate-900">{reply.reply_category || "Reply received"}</p>
                          <p className="mt-1">{reply.reply_sentiment || "-"}</p>
                          <p className="mt-1">{reply.subject || "-"}</p>
                          <p className="mt-1 text-slate-500">{formatDate(reply.received_at)}</p>
                        </>
                      ) : "-"}
                    </td>
                    <td className="p-4">
                      {event.enquiry_id ? (
                        <a className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white" href={`/admin/leads/${event.enquiry_id}`}>
                          Lead
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No lead yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!events.length && (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={9}>
                    No opened interest events yet. Once a verified visitor opens Show Interest, they will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
