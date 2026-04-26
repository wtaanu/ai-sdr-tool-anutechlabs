"use client";

import { useState } from "react";

type BridgeDashboard = {
  segments?: Array<{ id: string; label: string; targetCount: number }>;
  mailTypes?: Array<{ id: string; label: string }>;
  weekendSendingBlocked?: boolean;
  prospects?: any[];
  drafts?: any[];
  replies?: any[];
  stats?: Record<string, any>;
  error?: string;
};

async function runAction(action: string, payload: Record<string, any> = {}) {
  const response = await fetch("/api/admin/client-acquisition/action", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Action failed.");
  return result;
}

export function SalesFunnelCommandCenter({ dashboard }: { dashboard: BridgeDashboard | null }) {
  const [segment, setSegment] = useState(dashboard?.segments?.[0]?.id || "saas_founders");
  const [mailType, setMailType] = useState(dashboard?.mailTypes?.[0]?.id || "intro_value_prop");
  const [sourceList, setSourceList] = useState("existing");
  const [limit, setLimit] = useState(50);
  const [message, setMessage] = useState("");
  const [runningAction, setRunningAction] = useState("");
  const [activeDraft, setActiveDraft] = useState<any | null>(null);
  const [prospectSearch, setProspectSearch] = useState("");
  const [prospectStatus, setProspectStatus] = useState("All");
  const [prospectSegment, setProspectSegment] = useState("All");
  const [isSegmentOpen, setIsSegmentOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({
    label: "",
    targetCount: 100,
    apolloKeywords: "",
    targetTitles: "",
    targetLocations: "",
    notes: ""
  });

  const prospects = dashboard?.prospects || [];
  const drafts = dashboard?.drafts || [];
  const replies = dashboard?.replies || [];
  const stats = dashboard?.stats || {};
  const filteredProspects = prospects.filter((prospect) => {
    const haystack = `${prospect.company_name || ""} ${prospect.buyer_name || ""} ${prospect.email || ""} ${prospect.industry || ""} ${prospect.country || ""} ${prospect.segment || ""}`.toLowerCase();
    const matchesSearch = !prospectSearch || haystack.includes(prospectSearch.toLowerCase());
    const matchesStatus = prospectStatus === "All" || prospect.prospect_status === prospectStatus;
    const matchesSegment = prospectSegment === "All" || prospect.segment === prospectSegment;
    return matchesSearch && matchesStatus && matchesSegment;
  });
  const prospectStatuses = Array.from(new Set(prospects.map((prospect) => prospect.prospect_status).filter(Boolean)));
  const prospectSegments = Array.from(new Set(prospects.map((prospect) => prospect.segment).filter(Boolean)));

  async function handleAction(action: string, payload: Record<string, any> = {}) {
    setMessage("");
    setRunningAction(action);
    try {
      const result = await runAction(action, payload);
      setMessage(result.error || `Done. ${result.draftsCreated ? `${result.draftsCreated} drafts created.` : ""}${result.migrated !== undefined ? ` ${result.migrated} prospects synced.` : ""}${result.generated !== undefined ? ` ${result.generated} prospects generated.` : ""}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setRunningAction("");
    }
  }

  async function createSegment() {
      const result = await runAction("createSegment", newSegment);
    setMessage(`Segment created: ${result.segment?.label || newSegment.label}. Refresh the page to use it in the selector.`);
    setIsSegmentOpen(false);
    setNewSegment({ label: "", targetCount: 100, apolloKeywords: "", targetTitles: "", targetLocations: "", notes: "" });
  }

  return (
    <section className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black text-slate-950">Left panel actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Run only the actions you need. Results and progress appear below.</p>
          <div className="mt-5 space-y-3">
            <button className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600" disabled={Boolean(runningAction)} onClick={() => void handleAction("migrateProspects")} type="button">
              {runningAction === "migrateProspects" ? "Syncing valid sheet..." : "Sync valid sheet"}
            </button>
            <button className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 hover:border-orange-400" disabled={Boolean(runningAction)} onClick={() => void handleAction("generateProspects", { mode: "new" })} type="button">
              {runningAction === "generateProspects" ? "Generating prospects..." : "Run Apollo + score + verify"}
            </button>
            <button className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 hover:border-orange-400" onClick={() => setIsSegmentOpen((current) => !current)} type="button">
              Add segment
            </button>
          </div>
          {message && <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{message}</p>}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-black text-slate-950">Recent email events</h3>
          <div className="mt-4 space-y-3">
            {(dashboard as any)?.emailEvents?.slice?.(0, 8)?.map((event: any) => (
              <div key={`${event.draft_id}-${event.event_type}-${event.created_at}`} className="rounded-md bg-slate-50 p-3">
                <p className="font-bold text-slate-950">{event.email || "Unknown recipient"}</p>
                <p className="mt-1 text-xs text-orange-700">{event.event_type}</p>
                <p className="mt-1 text-xs text-slate-500">{event.subject_line || "No subject"}</p>
              </div>
            )) || <p className="text-sm text-slate-500">No email events yet.</p>}
          </div>
        </div>
      </aside>

      <div className="space-y-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Warm email command center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Generate Apollo prospects, sync valid sheet data to Supabase, create segment-specific drafts, review exact previews, send approved emails, and manage replies/follow-ups from one funnel.
            </p>
            {dashboard?.weekendSendingBlocked && (
              <p className="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Weekend sending is blocked. Draft/review can continue, but warm emails should send Monday-Friday.</p>
            )}
          </div>
        </div>

        {isSegmentOpen && (
          <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-5">
            <h3 className="text-lg font-black text-slate-950">Create custom prospect segment</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" onChange={(event) => setNewSegment((current) => ({ ...current, label: event.target.value }))} placeholder="Segment name e.g. Dental clinics" value={newSegment.label} />
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" onChange={(event) => setNewSegment((current) => ({ ...current, apolloKeywords: event.target.value }))} placeholder="Apollo keywords" value={newSegment.apolloKeywords} />
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" onChange={(event) => setNewSegment((current) => ({ ...current, targetTitles: event.target.value }))} placeholder="Target titles" value={newSegment.targetTitles} />
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" onChange={(event) => setNewSegment((current) => ({ ...current, targetLocations: event.target.value }))} placeholder="Target locations" value={newSegment.targetLocations} />
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" max={500} min={1} onChange={(event) => setNewSegment((current) => ({ ...current, targetCount: Number(event.target.value) }))} placeholder="Target count" type="number" value={newSegment.targetCount} />
              <input className="rounded-md border border-orange-200 px-3 py-3 text-sm" onChange={(event) => setNewSegment((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes / strategy" value={newSegment.notes} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600" disabled={!newSegment.label} onClick={() => void createSegment()} type="button">
                Save segment
              </button>
              <button className="rounded-md px-4 py-3 text-sm font-bold text-slate-700" onClick={() => setIsSegmentOpen(false)} type="button">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Prospects", stats.totalProspects || prospects.length],
            ["Ready drafts", stats.readyDrafts || 0],
            ["Reviewed", stats.reviewedDrafts || 0],
            ["Sent", stats.sentEvents || 0],
            ["Replies", stats.replies || replies.length]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="text-xl font-black text-slate-950">Create next campaign batch</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_120px]">
          <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setSegment(event.target.value)} value={segment}>
            {(dashboard?.segments || []).map((item) => <option key={item.id} value={item.id}>{item.label} ({item.targetCount})</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setMailType(event.target.value)} value={mailType}>
            {(dashboard?.mailTypes || []).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setSourceList(event.target.value)} value={sourceList}>
            <option value="existing">Use existing verified/scored list</option>
            <option value="new">Generate new Apollo + ZeroBounce list</option>
            <option value="followup">Use follow-up due list</option>
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" max={100} min={1} onChange={(event) => setLimit(Number(event.target.value))} type="number" value={limit} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-400 disabled:opacity-60" disabled={Boolean(runningAction)} onClick={() => void handleAction("generateDrafts", { segment, mailType, sourceList, limit })}>
            {runningAction === "generateDrafts" ? "Generating AI drafts..." : "Generate AI drafts"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Draft review queue</h3>
          <div className="mt-5 space-y-3">
            {drafts.slice(0, 20).map((draft) => (
              <button key={draft.id} className="block w-full rounded-md border border-slate-200 bg-slate-50 p-4 text-left hover:border-orange-300" onClick={() => setActiveDraft(draft)} type="button">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="font-bold text-slate-950">{draft.sales_prospects?.company_name || draft.segment}</p>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{draft.draft_status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{draft.subject_line}</p>
                <p className="mt-1 text-xs text-slate-500">{draft.mail_type} · step {draft.sequence_step} · {draft.sales_prospects?.email}</p>
              </button>
            ))}
            {!drafts.length && <p className="text-sm text-slate-500">No campaign drafts yet.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Exact email preview</h3>
          {activeDraft ? (
            <div className="mt-5">
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-bold" defaultValue={activeDraft.subject_line} id="draft-subject" />
              <textarea className="mt-3 min-h-56 w-full rounded-md border border-slate-300 px-3 py-3 text-sm leading-6" defaultValue={activeDraft.email_body_text} id="draft-body" />
              <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-orange-600">Preview</p>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: activeDraft.preview_html || activeDraft.email_body_html || "" }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600" onClick={() => {
                  const subject = (document.getElementById("draft-subject") as HTMLInputElement)?.value;
                  const body = (document.getElementById("draft-body") as HTMLTextAreaElement)?.value;
                  void handleAction("reviewDraft", { draftId: activeDraft.id, subjectLine: subject, emailBodyText: body, emailBodyHtml: body.split("\n").map((line) => line ? `<p>${line}</p>` : "<br />").join(""), status: "reviewed" });
                }}>
                  Mark reviewed
                </button>
                <button className="rounded-md bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-400" onClick={() => void handleAction("sendDraft", { draftId: activeDraft.id })}>
                  Send email
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Select a draft to review the exact email content before sending.</p>
          )}
        </section>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Prospects</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setProspectSearch(event.target.value)} placeholder="Search company, email, industry" value={prospectSearch} />
            <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setProspectSegment(event.target.value)} value={prospectSegment}>
              <option>All</option>
              {prospectSegments.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setProspectStatus(event.target.value)} value={prospectStatus}>
              <option>All</option>
              {prospectStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="mt-5 max-h-[520px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr><th className="py-3 pr-4">Lead</th><th className="py-3 pr-4">Segment</th><th className="py-3 pr-4">Score</th><th className="py-3 pr-4">Status</th></tr>
              </thead>
              <tbody>
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4"><p className="font-bold text-slate-950">{prospect.company_name || prospect.email}</p><p className="text-xs text-slate-500">{prospect.buyer_name} · {prospect.email}</p><p className="text-xs text-slate-500">{prospect.industry} · {prospect.country}</p></td>
                    <td className="py-3 pr-4 text-slate-700">{prospect.segment}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{prospect.lead_score || 0}</span></td>
                    <td className="py-3 pr-4 text-slate-700">{prospect.prospect_status}</td>
                  </tr>
                ))}
                {!filteredProspects.length && (
                  <tr><td className="py-5 text-slate-500" colSpan={4}>No prospects match the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Replies and next steps</h3>
          <div className="mt-5 space-y-3">
            {replies.slice(0, 20).map((reply) => (
              <article key={reply.id} className="rounded-md bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{reply.from_email}</p>
                <p className="mt-1 text-xs text-slate-500">{reply.reply_category} · {reply.reply_sentiment}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{reply.next_action}</p>
              </article>
            ))}
            {!replies.length && <p className="text-sm text-slate-500">No replies captured yet.</p>}
          </div>
        </section>
      </div>
      </div>
    </section>
  );
}
