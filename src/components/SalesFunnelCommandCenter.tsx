"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BridgeDashboard = {
  segments?: Array<{ id: string; label: string; targetCount: number; apolloKeywords?: string; titles?: string }>;
  mailTypes?: Array<{ id: string; label: string }>;
  weekendSendingBlocked?: boolean;
  prospects?: any[];
  drafts?: any[];
  replies?: any[];
  stats?: Record<string, any>;
  emailEvents?: any[];
  events?: any[];
};

const stageConfig = [
  { id: "raw", label: "Raw", statuses: ["new"] },
  { id: "scored", label: "Scored", statuses: ["scored"] },
  { id: "approved", label: "Approved", statuses: ["verified"] },
  { id: "sent", label: "Sent", statuses: ["sent", "sequence_complete"] },
  { id: "followup", label: "Follow-up pending", statuses: ["followup_due", "sent"] },
  { id: "failed", label: "Failed", statuses: ["failed"] },
  { id: "replied", label: "Replies", statuses: ["replied"] }
];

const actionLabels: Record<string, string> = {
  migrateProspects: "Google Sheets sync",
  purgeFailedProspects: "Failed email cleanup",
  generateDrafts: "AI draft generation",
  generateProspects: "Apollo lead pull",
  reviewDraft: "Draft review",
  sendDraft: "Email send",
  createManualProspect: "Manual lead creation"
};

const initialManualLead = {
  companyName: "",
  buyerName: "",
  buyerTitle: "",
  email: "",
  industry: "",
  country: "",
  website: "",
  segment: "general_b2b",
  leadScore: 0,
  notes: ""
};

async function runAction(action: string, payload: Record<string, any> = {}) {
  const response = await fetch("/api/admin/client-acquisition/action", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload })
  });
  const result = await response.json();
  if (response.status === 401) {
    window.location.href = "/admin/login";
    throw new Error(result.error || "Admin session expired. Please login again.");
  }
  if (!response.ok) throw new Error(result.error || "Action failed.");
  return result;
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function SalesFunnelCommandCenter({ dashboard }: { dashboard: BridgeDashboard | null }) {
  const router = useRouter();
  const prospects = dashboard?.prospects || [];
  const drafts = dashboard?.drafts || [];
  const replies = dashboard?.replies || [];
  const events = dashboard?.emailEvents || dashboard?.events || [];
  const segments = dashboard?.segments || [];
  const mailTypes = dashboard?.mailTypes || [];

  const [activeStage, setActiveStage] = useState("raw");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [segment, setSegment] = useState(segments[0]?.id || "saas_founders");
  const [mailType, setMailType] = useState(mailTypes[0]?.id || "intro_value_prop");
  const [sourceList, setSourceList] = useState("raw");
  const [limit, setLimit] = useState(50);
  const [draftInstruction, setDraftInstruction] = useState("");
  const [activeDraft, setActiveDraft] = useState<any | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [runningAction, setRunningAction] = useState("");
  const [apolloFilters, setApolloFilters] = useState({
    includeKeywords: segments[0]?.apolloKeywords || "operations,revops,sales ops,customer success",
    targetTitles: segments[0]?.titles || "Founder,CEO,Co-Founder,Head of Sales",
    targetLocations: "United States,United Kingdom,India",
    emailStatus: "verified,likely to engage",
    companySize: "",
    excludeKeywords: "",
    revenue: "",
    perPage: 25
  });
  const [manualLead, setManualLead] = useState(initialManualLead);

  const failedEmails = useMemo(() => new Set(events.filter((event: any) => event.event_type === "failed").map((event: any) => event.email).filter(Boolean)), [events]);
  const latestFailureByEmail = useMemo(() => {
    const lookup = new Map<string, any>();
    for (const event of events) {
      if (event.event_type === "failed" && event.email && !lookup.has(event.email)) {
        lookup.set(event.email, event);
      }
    }
    return lookup;
  }, [events]);
  const enrichedProspects = useMemo(() => prospects.map((prospect) => ({
    ...prospect,
    prospect_status: failedEmails.has(prospect.email) ? "failed" : prospect.prospect_status
  })), [prospects, failedEmails]);

  const activeConfig = stageConfig.find((stage) => stage.id === activeStage) || stageConfig[0];
  const stageCounts = Object.fromEntries(stageConfig.map((stage) => [
    stage.id,
    enrichedProspects.filter((prospect) => stage.statuses.includes(prospect.prospect_status)).length
  ]));
  const roleOptions = Array.from(new Set(enrichedProspects.map((prospect) => prospect.buyer_title).filter(Boolean))).slice(0, 50);
  const visibleProspects = enrichedProspects.filter((prospect) => {
    const haystack = `${prospect.company_name || ""} ${prospect.buyer_name || ""} ${prospect.email || ""} ${prospect.industry || ""} ${prospect.country || ""} ${prospect.segment || ""} ${prospect.buyer_title || ""}`.toLowerCase();
    return activeConfig.statuses.includes(prospect.prospect_status)
      && (!search || haystack.includes(search.toLowerCase()))
      && (roleFilter === "All" || prospect.buyer_title === roleFilter);
  });
  const selectedProspects = visibleProspects.filter((prospect) => selectedIds.includes(prospect.id));
  const visibleDrafts = drafts.slice(0, 50);
  const selectedDrafts = visibleDrafts.filter((draft) => selectedDraftIds.includes(draft.id));

  async function handleAction(action: string, payload: Record<string, any> = {}) {
    const actionLabel = actionLabels[action] || "Action";
    setMessage(`${actionLabel} is running...`);
    setMessageType("loading");
    setRunningAction(action);
    try {
      const result = await runAction(action, payload);
      const syncedCount = result.migrated ?? result.count;
      const sourceRows = result.sourceRows || result.migration?.sourceRows;
      const sourceSummary = sourceRows ? ` Source rows: approved ${sourceRows.approved || 0}, scored ${sourceRows.scored || 0}, raw ${sourceRows.raw || 0}.` : "";
      const failedPreview = Array.isArray(result.results)
        ? result.results.filter((item: any) => !item.ok).slice(0, 3).map((item: any) => `${item.email || item.draftId}: ${item.error}`).join(" | ")
        : "";
      setMessageType(result.error ? "error" : "success");
      setMessage(result.error || `${actionLabel} completed.${result.draftsCreated !== undefined ? ` ${result.draftsCreated} drafts created.` : ""}${result.reviewed !== undefined ? ` ${result.reviewed} drafts marked reviewed.` : ""}${result.sent !== undefined ? ` ${result.sent} emails sent.` : ""}${result.failed !== undefined ? ` ${result.failed} failed.` : ""}${failedPreview ? ` Failed examples: ${failedPreview}` : ""}${syncedCount !== undefined ? ` ${syncedCount} prospects synced.` : ""}${result.removed !== undefined ? ` ${result.removed} failed prospects removed.` : ""}${sourceSummary}`);
      if (action === "sendDraft" && Number(result.failed || 0) > 0) {
        setMessageType("error");
        setActiveStage("failed");
        setSelectedDraftIds([]);
        setSelectedIds([]);
      }
      if (action === "createManualProspect" && result.prospect) {
        setActiveStage(result.prospect.prospect_status === "scored" ? "scored" : "raw");
        setSearch(result.prospect.email || payload.email || "");
        setRoleFilter("All");
        setSelectedIds([]);
        setManualLead(initialManualLead);
        setMessageType("success");
        setMessage(`Lead created successfully. View it in ${result.prospect.prospect_status === "scored" ? "Scored" : "Raw"} lead list, filtered by ${result.prospect.email}.`);
      }
      router.refresh();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setRunningAction("");
    }
  }

  function toggleProspect(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selectVisible() {
    setSelectedIds(visibleProspects.map((prospect) => prospect.id));
  }

  function toggleDraft(id: string) {
    setSelectedDraftIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function htmlFromText(value: string) {
    return value.split("\n").map((line) => line ? `<p>${line.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char] || char))}</p>` : "<br />").join("");
  }

  async function markActiveDraftReviewed() {
    if (!activeDraft?.id) {
      setMessage("Select a draft preview first.");
      setMessageType("error");
      return;
    }
    const subject = (document.getElementById("draft-subject") as HTMLInputElement)?.value || activeDraft.subject_line;
    const body = (document.getElementById("draft-body") as HTMLTextAreaElement)?.value || activeDraft.email_body_text;
    const html = htmlFromText(body);
    await handleAction("reviewDraft", { draftId: activeDraft.id, subjectLine: subject, emailBodyText: body, emailBodyHtml: html, previewHtml: html, status: "reviewed" });
    setActiveDraft((current: any) => current ? { ...current, subject_line: subject, email_body_text: body, email_body_html: html, preview_html: html, draft_status: "reviewed" } : current);
  }

  async function sendActiveDraft() {
    if (!activeDraft?.id) {
      setMessage("Select a draft preview first.");
      setMessageType("error");
      return;
    }
    await handleAction("sendDraft", { draftId: activeDraft.id });
    setActiveDraft((current: any) => current ? { ...current, draft_status: "sent", send_result: "sent" } : current);
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" disabled={Boolean(runningAction)} onClick={() => void handleAction("migrateProspects")}>
            {runningAction === "migrateProspects" ? "Syncing..." : "Sync Google Sheets"}
          </button>
          <button className="rounded-md border border-red-200 px-4 py-3 text-sm font-bold text-red-700" disabled={Boolean(runningAction)} onClick={() => void handleAction("purgeFailedProspects")}>
            {runningAction === "purgeFailedProspects" ? "Removing..." : "Remove failed emails"}
          </button>
        </div>
      </div>

      <div
        className={`rounded-lg border px-5 py-4 text-sm font-bold leading-6 shadow-soft ${
          messageType === "loading"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : messageType === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : messageType === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message || "Action status will appear here after you click any admin button."}
      </div>

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {stageConfig.map((stage) => (
          <button key={stage.id} className={`rounded-lg border p-4 text-left shadow-soft ${activeStage === stage.id ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"}`} onClick={() => { setActiveStage(stage.id); setSelectedIds([]); }}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{stage.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{stageCounts[stage.id] || 0}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-xl font-black text-slate-950">{activeConfig.label} lead list</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedProspects.length} selected from {visibleProspects.length} visible rows.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700" onClick={selectVisible}>Select visible</button>
              <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedIds([])}>Unselect all</button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Search company, email, industry, country, role" value={search} />
            <select className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
              <option>All</option>
              {roleOptions.map((role) => <option key={role}>{role}</option>)}
            </select>
          </div>
          <div className="mt-5 max-h-[620px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr><th className="py-3 pr-3">Pick</th><th className="py-3 pr-4">Lead</th><th className="py-3 pr-4">Segment</th><th className="py-3 pr-4">Score</th><th className="py-3 pr-4">Status</th></tr>
              </thead>
              <tbody>
                {visibleProspects.map((prospect) => {
                  const failure = latestFailureByEmail.get(prospect.email);
                  return (<>
                  <tr key={prospect.id} className="border-t border-slate-100">
                    <td className="py-3 pr-3"><input checked={selectedIds.includes(prospect.id)} onChange={() => toggleProspect(prospect.id)} type="checkbox" /></td>
                    <td className="py-3 pr-4"><p className="font-bold text-slate-950">{prospect.company_name || prospect.email}</p><p className="text-xs text-slate-500">{prospect.buyer_name || "No name"} · {prospect.buyer_title || "No role"}</p><p className="text-xs text-slate-500">{prospect.email} · {prospect.industry || "No industry"} · {prospect.country || "No country"}</p></td>
                    <td className="py-3 pr-4 text-slate-700">{prospect.segment || "general_b2b"}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{prospect.lead_score || 0}</span></td>
                    <td className="py-3 pr-4 text-slate-700">{prospect.prospect_status}</td>
                  </tr>
                    {activeStage === "failed" && (
                      <tr className="border-t border-red-100 bg-red-50/60">
                        <td className="py-3 pr-3" />
                        <td className="py-3 pr-4 text-xs font-semibold leading-5 text-red-700" colSpan={4}>
                          Failure reason: {failure?.detail || prospect.verification_notes || "No provider detail captured yet."}
                        </td>
                      </tr>
                    )}
                  </>
                )})}
                {!visibleProspects.length && <tr><td className="py-5 text-slate-500" colSpan={5}>No leads in this stage yet. Sync Sheets or pull Apollo leads.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-black text-slate-950">Create next campaign batch</h3>
            <div className="mt-5 space-y-3">
              <select className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setSourceList(event.target.value)} value={sourceList}>
                <option value="raw">Raw list</option>
                <option value="scored">Scored list</option>
                <option value="approved">Approved list</option>
                <option value="sent">Already sent list</option>
                <option value="followup">Follow-up due list</option>
                <option value="existing">Existing mixed list</option>
              </select>
              <select className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setSegment(event.target.value)} value={segment}>
                {segments.map((item) => <option key={item.id} value={item.id}>{item.label} ({item.targetCount})</option>)}
              </select>
              <select className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setMailType(event.target.value)} value={mailType}>
                {mailTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" max={100} min={1} onChange={(event) => setLimit(Number(event.target.value))} type="number" value={limit} />
              <textarea className="min-h-36 w-full rounded-md border border-slate-300 px-3 py-3 text-sm leading-6" onChange={(event) => setDraftInstruction(event.target.value)} placeholder="Optional AI draft instruction: paste your video URL, offer, email structure, CTA, objections, tone, or special personalization notes." value={draftInstruction} />
              <button className="w-full rounded-md bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-400 disabled:opacity-60" disabled={Boolean(runningAction)} onClick={() => void handleAction("generateDrafts", { segment, mailType, sourceList, limit, draftInstruction, prospectIds: selectedIds })}>
                {runningAction === "generateDrafts" ? "Generating drafts..." : `Generate AI drafts${selectedIds.length ? ` for ${selectedIds.length} selected` : ""}`}
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-black text-slate-950">Pull new Apollo leads</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">These filters are sent to Apollo, then leads are inserted into Raw Leads, scored, verified, and synced into Supabase.</p>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, includeKeywords: event.target.value }))} placeholder="Keywords" value={apolloFilters.includeKeywords} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, targetTitles: event.target.value }))} placeholder="Target roles" value={apolloFilters.targetTitles} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, targetLocations: event.target.value }))} placeholder="Target countries/locations" value={apolloFilters.targetLocations} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, emailStatus: event.target.value }))} placeholder="Email status" value={apolloFilters.emailStatus} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, companySize: event.target.value }))} placeholder="Company size, optional. Example: 1-10,11-50,51-200" value={apolloFilters.companySize} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, excludeKeywords: event.target.value }))} placeholder="Exclude keywords, optional. Example: student,intern,freelance" value={apolloFilters.excludeKeywords} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setApolloFilters((current) => ({ ...current, revenue: event.target.value }))} placeholder="Revenue, optional. Example: 1M-10M,10M-50M" value={apolloFilters.revenue} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm" max={100} min={1} onChange={(event) => setApolloFilters((current) => ({ ...current, perPage: Number(event.target.value) }))} type="number" value={apolloFilters.perPage} />
              <button className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600" disabled={Boolean(runningAction)} onClick={() => void handleAction("generateProspects", {
                mode: "new",
                apolloFilters: {
                  ...apolloFilters,
                  includeKeywords: splitList(apolloFilters.includeKeywords),
                  targetTitles: splitList(apolloFilters.targetTitles),
                  targetLocations: splitList(apolloFilters.targetLocations),
                  emailStatus: splitList(apolloFilters.emailStatus),
                  companySize: splitList(apolloFilters.companySize),
                  excludeKeywords: splitList(apolloFilters.excludeKeywords),
                  revenue: splitList(apolloFilters.revenue)
                }
              })}>
                Pull Apollo leads + auto score
              </button>
            </div>
          </section>
        </aside>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Draft review queue</h3>
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600">{selectedDrafts.length} selected from {visibleDrafts.length} visible drafts.</p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700" onClick={() => setSelectedDraftIds(visibleDrafts.map((draft) => draft.id).filter(Boolean))} type="button">Select all</button>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700" onClick={() => setSelectedDraftIds([])} type="button">Unselect all</button>
              <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300" disabled={!selectedDraftIds.length || Boolean(runningAction)} onClick={() => void handleAction("reviewDraft", { draftIds: selectedDraftIds, status: "reviewed" })} type="button">{runningAction === "reviewDraft" ? "Marking..." : "Mark selected reviewed"}</button>
              <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300" disabled={!selectedDraftIds.length || Boolean(runningAction)} onClick={() => void handleAction("sendDraft", { draftIds: selectedDraftIds })} type="button">{runningAction === "sendDraft" ? "Sending..." : "Send selected"}</button>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {visibleDrafts.map((draft) => (
              <div key={draft.id} className={`flex gap-3 rounded-md border bg-slate-50 p-4 hover:border-orange-300 ${activeDraft?.id === draft.id ? "border-orange-400" : "border-slate-200"}`}>
                <input checked={selectedDraftIds.includes(draft.id)} className="mt-1" onChange={() => toggleDraft(draft.id)} type="checkbox" />
                <button className="block flex-1 text-left" onClick={() => setActiveDraft(draft)} type="button">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="font-bold text-slate-950">{draft.sales_prospects?.company_name || draft.segment}</p>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{draft.draft_status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{draft.subject_line}</p>
                <p className="mt-1 text-xs text-slate-500">{draft.mail_type} · step {draft.sequence_step} · {draft.sales_prospects?.email}</p>
                </button>
              </div>
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
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-orange-600">Common preview</p>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: activeDraft.preview_html || activeDraft.email_body_html || "" }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" disabled={Boolean(runningAction)} onClick={() => void markActiveDraftReviewed()} type="button">
                  {runningAction === "reviewDraft" ? "Marking reviewed..." : "Mark reviewed"}
                </button>
                <button className="rounded-md bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-400 disabled:bg-slate-300" disabled={Boolean(runningAction)} onClick={() => void sendActiveDraft()} type="button">
                  {runningAction === "sendDraft" ? "Sending email..." : "Send email"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Select a row to preview exactly what will be sent.</p>
          )}
        </section>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Manual raw/scored lead</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company" value={manualLead.companyName} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, email: event.target.value }))} placeholder="Email" value={manualLead.email} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, buyerName: event.target.value }))} placeholder="Buyer name" value={manualLead.buyerName} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, buyerTitle: event.target.value }))} placeholder="Role" value={manualLead.buyerTitle} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, industry: event.target.value }))} placeholder="Industry" value={manualLead.industry} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, country: event.target.value }))} placeholder="Country" value={manualLead.country} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, segment: event.target.value }))} placeholder="Segment" value={manualLead.segment} />
            <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, leadScore: Number(event.target.value) }))} placeholder="Score" type="number" value={manualLead.leadScore} />
          </div>
          <textarea className="mt-3 min-h-24 w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setManualLead((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes / pain / reason" value={manualLead.notes} />
          <button className="mt-4 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" disabled={!manualLead.email || Boolean(runningAction)} onClick={() => void handleAction("createManualProspect", manualLead)}>
            {runningAction === "createManualProspect" ? "Creating lead..." : "Create lead"}
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-slate-950">Replies and last activity</h3>
          <div className="mt-5 space-y-3">
            {replies.slice(0, 12).map((reply) => (
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
    </section>
  );
}
