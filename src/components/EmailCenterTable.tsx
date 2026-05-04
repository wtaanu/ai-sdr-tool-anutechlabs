"use client";

import { useMemo, useState } from "react";

const pageSize = 50;

type EmailRow = {
  id: string;
  source: string;
  type: string;
  subject: string;
  leadName: string;
  leadEmail: string;
  status: string;
  provider: string;
  sentAt: string | null;
  createdAt: string | null;
  previewHtml: string;
  bodyText: string;
  nextFollowupAt: string | null;
  followupCount: number;
};

export function EmailCenterTable({ emails, initialStatus = "All", initialSource = "All" }: { emails: EmailRow[]; initialStatus?: string; initialSource?: string }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [source, setSource] = useState(initialSource);
  const statuses = useMemo(() => Array.from(new Set(emails.map((email) => email.status).filter(Boolean))), [emails]);
  const sources = useMemo(() => Array.from(new Set(emails.map((email) => email.source).filter(Boolean))), [emails]);
  const filteredEmails = emails.filter((email) => (status === "All" || email.status === status) && (source === "All" || email.source === source));
  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageEmails = filteredEmails.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <p className="text-sm font-bold text-slate-600">{filteredEmails.length} emails found. Showing 50 per page.</p>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}>
            <option>All</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(event) => { setSource(event.target.value); setPage(1); }} value={source}>
            <option>All</option>
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
              <th className="p-4">Source</th>
              <th className="p-4">Type</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Lead</th>
              <th className="p-4">Status</th>
              <th className="p-4">Provider detail</th>
              <th className="p-4">Preview</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {pageEmails.map((email) => (
              <tr key={email.id} className="border-b border-slate-100 align-top">
                <td className="p-4 font-bold text-orange-700">{email.source}</td>
                <td className="p-4 font-bold text-slate-950">{email.type}</td>
                <td className="max-w-[280px] p-4 text-slate-700">{email.subject}</td>
                <td className="p-4 text-slate-600">{email.leadName}<br /><span className="text-xs text-slate-500">{email.leadEmail}</span></td>
                <td className="p-4"><span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{email.status}</span></td>
                <td className="max-w-[220px] p-4 text-xs text-slate-500">{email.provider}</td>
                <td className="max-w-[360px] p-4 text-xs leading-5 text-slate-600">
                  {email.previewHtml ? (
                    <details>
                      <summary className="cursor-pointer font-bold text-orange-700">Open preview</summary>
                      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3" dangerouslySetInnerHTML={{ __html: email.previewHtml }} />
                    </details>
                  ) : email.bodyText ? (
                    <details>
                      <summary className="cursor-pointer font-bold text-orange-700">Open text</summary>
                      <pre className="mt-3 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 font-sans">{email.bodyText}</pre>
                    </details>
                  ) : "-"}
                  {email.nextFollowupAt && <p className="mt-2 text-[11px] font-bold text-slate-500">Next follow-up: {new Date(email.nextFollowupAt).toLocaleString()}</p>}
                </td>
                <td className="p-4 text-xs text-slate-500">{email.createdAt ? new Date(email.createdAt).toLocaleString() : "No date"}</td>
              </tr>
            ))}
            {!pageEmails.length && (
              <tr><td className="p-8 text-center text-slate-500" colSpan={8}>No email logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-slate-500">
          Showing {filteredEmails.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredEmails.length)} of {filteredEmails.length}
        </p>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Previous</button>
          <span className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">{currentPage} / {totalPages}</span>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} type="button">Next</button>
        </div>
      </div>
    </div>
  );
}
