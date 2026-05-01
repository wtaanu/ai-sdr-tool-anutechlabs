import { FreeAuditFollowupActions } from "@/components/FreeAuditFollowupActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  user_id: string;
  opportunity_score: number | null;
  roi_potential: string | null;
  email_status: string | null;
  report_json: any;
  created_at: string;
  public_users:
    | {
        full_name: string | null;
        email: string | null;
        company: string | null;
        country: string | null;
      }
    | Array<{
        full_name: string | null;
        email: string | null;
        company: string | null;
        country: string | null;
      }>
    | null;
};

type ReplyRow = {
  from_email: string | null;
  subject: string | null;
  received_at: string | null;
};

function getUser(row: AuditRow) {
  return Array.isArray(row.public_users) ? row.public_users[0] || null : row.public_users;
}

function getAuditStatus(row: AuditRow) {
  const json = row.report_json && typeof row.report_json === "object" ? row.report_json : {};
  return json.status || (row.opportunity_score ? "summary_generated" : "started");
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

function isOlderThanTwoDays(value: string) {
  return Date.now() - new Date(value).getTime() > 2 * 24 * 60 * 60 * 1000;
}

export default async function AdminFreeAuditsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("free_audit_requests")
    .select("id,user_id,opportunity_score,roi_potential,email_status,report_json,created_at,public_users(full_name,email,company,country)")
    .order("created_at", { ascending: false })
    .limit(250);

  const audits = (data || []) as unknown as AuditRow[];
  const emails = Array.from(new Set(audits.map((audit) => getUser(audit)?.email).filter(Boolean))) as string[];
  const { data: replies } = emails.length
    ? await supabase
        .from("sales_inbox_replies")
        .select("from_email,subject,received_at")
        .in("from_email", emails)
        .order("received_at", { ascending: false })
    : { data: [] };

  const replyByEmail = new Map<string, ReplyRow>();
  for (const reply of (replies || []) as ReplyRow[]) {
    if (reply.from_email && !replyByEmail.has(reply.from_email)) {
      replyByEmail.set(reply.from_email, reply);
    }
  }

  const started = audits.filter((audit) => getAuditStatus(audit) === "started").length;
  const generated = audits.filter((audit) => getAuditStatus(audit) === "summary_generated").length;
  const callClicked = audits.filter((audit) => getAuditStatus(audit) === "strategy_call_clicked").length;
  const dueFollowup = audits.filter((audit) => {
    const user = getUser(audit);
    return isOlderThanTwoDays(audit.created_at) && Boolean(user?.email) && !replyByEmail.has(user!.email!);
  }).length;

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">audit funnel</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">Free Audit Tracking</h1>
            <p className="mt-2 text-sm text-slate-600">Track audit starts, completed summaries, call intent, replies, and follow-ups.</p>
          </div>
          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Started", started],
            ["Summary generated", generated],
            ["Call clicked", callClicked],
            ["2-day follow-up due", dueFollowup]
          ].map(([label, value]) => (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" key={label}>
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="p-4">Lead</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Reply</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => {
                  const user = getUser(audit);
                  const reply = user?.email ? replyByEmail.get(user.email) : null;
                  const status = getAuditStatus(audit);
                  const due = isOlderThanTwoDays(audit.created_at) && user?.email && !reply;

                  return (
                    <tr className="border-b border-slate-100 align-top" key={audit.id}>
                      <td className="p-4">
                        <p className="font-bold text-slate-950">{user?.full_name || "Unknown"}</p>
                        <p className="mt-1 text-xs text-slate-500">{user?.email || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">{user?.company || "-"}</p>
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "started" ? "bg-slate-100 text-slate-700" : status === "strategy_call_clicked" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                          {status}
                        </span>
                        {due && <p className="mt-2 text-xs font-bold text-red-600">No response in 2 days</p>}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-950">{audit.roi_potential || "Pending"}</p>
                        <p className="mt-1 text-xs text-slate-500">Score: {audit.opportunity_score || 0}</p>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{audit.email_status || "pending"}</span>
                      </td>
                      <td className="p-4">
                        {reply ? (
                          <>
                            <p className="font-bold text-green-700">Reply received</p>
                            <p className="mt-1 text-xs text-slate-500">{reply.subject || "-"}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(reply.received_at)}</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-500">No reply logged</p>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500">{formatDate(audit.created_at)}</td>
                      <td className="p-4">
                        <FreeAuditFollowupActions auditId={audit.id} />
                      </td>
                    </tr>
                  );
                })}
                {!audits.length && (
                  <tr>
                    <td className="p-8 text-center text-slate-500" colSpan={7}>No free audit records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
