"use client";

import { useState } from "react";

const followupTypes = [
  ["value_reminder", "Value reminder"],
  ["roadmap_help", "Roadmap help"],
  ["strategy_call", "Strategy call invite"],
  ["case_study", "Case study angle"]
];

export function FreeAuditFollowupActions({ auditId }: { auditId: string }) {
  const [followupType, setFollowupType] = useState("value_reminder");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendFollowup() {
    setIsSending(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/free-audits/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, followupType })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send follow-up.");
      }

      setStatus("Follow-up sent/logged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send follow-up.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-w-[220px] flex-col gap-2">
      <select className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700" onChange={(event) => setFollowupType(event.target.value)} value={followupType}>
        {followupTypes.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300" disabled={isSending} onClick={() => void sendFollowup()} type="button">
        {isSending ? "Sending..." : "Send follow-up"}
      </button>
      {status && <p className="text-xs text-slate-500">{status}</p>}
    </div>
  );
}
