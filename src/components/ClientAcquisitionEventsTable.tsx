"use client";

import { useMemo, useState } from "react";

const pageSize = 50;

const sourceLabels: Record<string, string> = {
  ai_sdr: "AI SDR website",
  apollo_client_acquisition: "Apollo acquisition",
  linkedin_future: "LinkedIn future",
  meta_future: "Meta future",
  my_sales_tool: "My Sales Tool"
};

type EventRow = {
  draft_id: string | null;
  draft_source: string;
  source_record_id: string | null;
  email: string | null;
  subject_line: string | null;
  event_type: string;
  detail?: string | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "No date";
}

export function ClientAcquisitionEventsTable({ events }: { events: EventRow[] }) {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("All");
  const eventTypes = useMemo(() => Array.from(new Set(events.map((event) => event.event_type).filter(Boolean))), [events]);
  const filteredEvents = eventType === "All" ? events : events.filter((event) => event.event_type === eventType);
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-950">Recent email events</h2>
          <p className="mt-1 text-sm text-slate-500">Full event log with 50 rows per page.</p>
        </div>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(event) => { setEventType(event.target.value); setPage(1); }} value={eventType}>
          <option>All</option>
          {eventTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-3 py-3">Event</th>
              <th className="px-3 py-3">Recipient</th>
              <th className="px-3 py-3">Subject</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Detail</th>
              <th className="px-3 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {pageEvents.map((event) => (
              <tr key={`${event.draft_id || event.source_record_id || event.email}-${event.event_type}-${event.created_at}`} className="border-b border-slate-100 align-top">
                <td className="px-3 py-3"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{event.event_type}</span></td>
                <td className="px-3 py-3 font-bold text-slate-950">{event.email || "Unknown recipient"}</td>
                <td className="max-w-md px-3 py-3 text-slate-600">{event.subject_line || "No subject"}</td>
                <td className="px-3 py-3 text-slate-600">{sourceLabels[event.draft_source] || event.draft_source || "Unknown"}</td>
                <td className="max-w-md px-3 py-3 text-xs leading-5 text-slate-500">{event.detail || event.source_record_id || "-"}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{formatDate(event.created_at)}</td>
              </tr>
            ))}
            {!pageEvents.length && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>No email events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-slate-500">
          Showing {filteredEvents.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length}
        </p>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Previous</button>
          <span className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">{currentPage} / {totalPages}</span>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} type="button">Next</button>
        </div>
      </div>
    </article>
  );
}
