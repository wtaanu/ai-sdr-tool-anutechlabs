import { SalesFunnelCommandCenter } from "@/components/SalesFunnelCommandCenter";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const sourceLabels: Record<string, string> = {
  ai_sdr: "AI SDR website",
  apollo_client_acquisition: "Apollo acquisition",
  linkedin_future: "LinkedIn future",
  meta_future: "Meta future",
  my_sales_tool: "My Sales Tool"
};

type SharedDraft = {
  draft_id: string;
  draft_source: string;
  source_record_id: string | null;
  company_name: string | null;
  buyer_name: string | null;
  email: string | null;
  subject_line: string | null;
  draft_status: string;
  send_result: string | null;
};

type SharedJob = {
  job_name: string;
  script_name: string | null;
  status: string;
  exit_code: number | null;
  source: string;
  created_at: string | null;
};

type SharedEvent = {
  draft_id: string | null;
  draft_source: string;
  source_record_id: string | null;
  email: string | null;
  subject_line: string | null;
  event_type: string;
  created_at: string | null;
};

async function getBridgeHealth(apiUrl: string) {
  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/health`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function getBridgeSalesDashboard(apiUrl: string) {
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/sales-dashboard`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function countRows(table: string, filter?: { column: string; value: string }) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;
  return error ? 0 : count || 0;
}

async function getSharedFunnelData() {
  try {
    const supabase = getSupabaseAdminClient();
    const [draftsResult, jobsResult, eventsResult, totalDrafts, sentEvents, queuedEvents, failedEvents, aiSdrDrafts, apolloDrafts] = await Promise.all([
      supabase
        .from("client_acquisition_outreach_drafts")
        .select("draft_id,draft_source,source_record_id,company_name,buyer_name,email,subject_line,draft_status,send_result")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("client_acquisition_job_runs")
        .select("job_name,script_name,status,exit_code,source,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("client_acquisition_email_events")
        .select("draft_id,draft_source,source_record_id,email,subject_line,event_type,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      countRows("client_acquisition_outreach_drafts"),
      countRows("client_acquisition_email_events", { column: "event_type", value: "sent" }),
      countRows("client_acquisition_email_events", { column: "event_type", value: "queued_draft" }),
      countRows("client_acquisition_email_events", { column: "event_type", value: "failed" }),
      countRows("client_acquisition_outreach_drafts", { column: "draft_source", value: "ai_sdr" }),
      countRows("client_acquisition_outreach_drafts", { column: "draft_source", value: "apollo_client_acquisition" })
    ]);

    return {
      drafts: (draftsResult.data || []) as SharedDraft[],
      jobs: (jobsResult.data || []) as SharedJob[],
      events: (eventsResult.data || []) as SharedEvent[],
      stats: {
        totalDrafts,
        sentEvents,
        queuedEvents,
        failedEvents,
        aiSdrDrafts,
        apolloDrafts
      },
      error: draftsResult.error?.message || jobsResult.error?.message || eventsResult.error?.message || ""
    };
  } catch (error) {
    return {
      drafts: [] as SharedDraft[],
      jobs: [] as SharedJob[],
      events: [] as SharedEvent[],
      stats: {
        totalDrafts: 0,
        sentEvents: 0,
        queuedEvents: 0,
        failedEvents: 0,
        aiSdrDrafts: 0,
        apolloDrafts: 0
      },
      error: error instanceof Error ? error.message : "Shared Supabase funnel is not configured."
    };
  }
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "No date";
}

export default async function ClientAcquisitionPage() {
  await requireAdminSession();
  const apiUrl = process.env.CLIENT_ACQUISITION_API_URL || "";
  const [bridgeHealth, sharedFunnel, bridgeSalesDashboard] = await Promise.all([getBridgeHealth(apiUrl), getSharedFunnelData(), getBridgeSalesDashboard(apiUrl)]);
  const futureSourceCount = Math.max(sharedFunnel.stats.totalDrafts - sharedFunnel.stats.aiSdrDrafts - sharedFunnel.stats.apolloDrafts, 0);
  const mergedDashboard = bridgeSalesDashboard ? { ...bridgeSalesDashboard, emailEvents: sharedFunnel.events } : { emailEvents: sharedFunnel.events };
  const readiness = [
    ["Railway bridge", Boolean(bridgeHealth?.ok), bridgeHealth?.service || "Bridge not reachable"],
    ["Email provider", Boolean(bridgeHealth?.emailProvider?.activeProvider && bridgeHealth.emailProvider.activeProvider !== "none"), bridgeHealth?.emailProvider?.activeProvider || "Not detected"],
    ["Shared Supabase", Boolean(bridgeHealth?.sharedSupabaseReady || !sharedFunnel.error), sharedFunnel.error || "Shared tables responding"],
    ["Sales dashboard API", Boolean(bridgeSalesDashboard && !bridgeSalesDashboard.error), bridgeSalesDashboard?.error || "Dashboard data loaded"],
    ["AI SDR bridge URL", Boolean(apiUrl), apiUrl || "CLIENT_ACQUISITION_API_URL missing"]
  ];

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">personal marketing funnel</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Client Acquisition</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              This section links AI SDR and My Sales Tool into one Supabase-backed operating console for Apollo leads, website enquiries, drafts, sends, follow-ups, replies, and calls.
            </p>
          </div>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">funnel path</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Apollo / Website / LinkedIn / Meta - Verified Leads - Scored Leads - Drafts - Reviewed 50 - Sent - Follow-Up - Replies - Calls - Won
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Shared drafts", String(sharedFunnel.stats.totalDrafts)],
            ["Sent emails", String(sharedFunnel.stats.sentEvents)],
            ["Queued drafts", String(sharedFunnel.stats.queuedEvents)],
            ["Failed sends", String(sharedFunnel.stats.failedEvents)]
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
            </article>
          ))}
        </div>

        <SalesFunnelCommandCenter dashboard={mergedDashboard} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Source split</h2>
            <div className="mt-5 space-y-3">
              {[
                ["AI SDR website", sharedFunnel.stats.aiSdrDrafts],
                ["Apollo acquisition", sharedFunnel.stats.apolloDrafts],
                ["Future LinkedIn/Meta", futureSourceCount]
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-md bg-slate-50 p-4">
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                  <span className="text-lg font-black text-orange-600">{String(value)}</span>
                </div>
              ))}
            </div>
            {sharedFunnel.error && (
              <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Shared DB note: {sharedFunnel.error}
              </p>
            )}
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Recent outreach drafts</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3">Lead</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedFunnel.drafts.map((draft) => (
                    <tr key={draft.draft_id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-bold text-orange-600">{sourceLabels[draft.draft_source] || draft.draft_source}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-950">{draft.company_name || draft.email || "Unknown lead"}</p>
                        <p className="text-xs text-slate-500">{draft.buyer_name || draft.email || draft.source_record_id}</p>
                      </td>
                      <td className="max-w-md px-3 py-3 text-slate-600">{draft.subject_line || "No subject yet"}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {draft.send_result || draft.draft_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sharedFunnel.drafts.length === 0 && (
                    <tr>
                      <td className="px-3 py-5 text-slate-500" colSpan={4}>No shared outreach drafts yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Recent Sales Tool jobs</h2>
            <div className="mt-5 space-y-3">
              {sharedFunnel.jobs.map((job) => (
                <div key={`${job.job_name}-${job.created_at}`} className="rounded-md bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <p className="font-bold text-slate-950">{job.job_name}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${job.status === "completed" ? "bg-green-50 text-green-700" : job.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{job.script_name || job.source} - {formatDate(job.created_at)}</p>
                </div>
              ))}
              {sharedFunnel.jobs.length === 0 && <p className="text-sm text-slate-500">No shared job runs logged yet.</p>}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Recent email events</h2>
            <div className="mt-5 space-y-3">
              {sharedFunnel.events.map((event) => (
                <div key={`${event.draft_id}-${event.event_type}-${event.created_at}`} className="rounded-md bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <p className="font-bold text-slate-950">{event.email || "Unknown recipient"}</p>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{event.event_type}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{event.subject_line || "No subject"}</p>
                  <p className="mt-2 text-xs text-slate-500">{sourceLabels[event.draft_source] || event.draft_source} - {formatDate(event.created_at)}</p>
                </div>
              ))}
              {sharedFunnel.events.length === 0 && <p className="text-sm text-slate-500">No shared email events logged yet.</p>}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-950">Integration readiness</h2>
          {bridgeHealth && (
            <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
              Bridge online - SMTP {bridgeHealth.smtpReady ? "ready" : "not configured"} - Shared DB {bridgeHealth.sharedSupabaseReady ? "ready" : "not configured"} - Checked {bridgeHealth.checkedAt}
            </div>
          )}
          <div className="mt-5 space-y-3">
            {readiness.map(([label, ok, detail]) => (
              <div key={String(label)} className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-4 md:flex-row md:items-center">
                <div>
                  <p className="font-bold text-slate-950">{label}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{String(detail)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {ok ? "Ready" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
