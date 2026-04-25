"use client";

import { useState } from "react";

export function DataRequestForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    requestType: "access",
    country: "",
    details: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit request.");
      }

      setMessage("Your request has been received and will be reviewed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("fullName", event.target.value)} placeholder="Full name" required value={form.fullName} />
      <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("email", event.target.value)} placeholder="Email address" required type="email" value={form.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <select className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("requestType", event.target.value)} value={form.requestType}>
          <option value="access">Access my data</option>
          <option value="correction">Correct my data</option>
          <option value="deletion">Delete my data</option>
          <option value="export">Export my data</option>
          <option value="withdraw_consent">Withdraw consent</option>
        </select>
        <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("country", event.target.value)} placeholder="Country" required value={form.country} />
      </div>
      <textarea className="min-h-28 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("details", event.target.value)} placeholder="Details optional" value={form.details} />
      <button className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit request"}
      </button>
      {message && <p className="rounded-md bg-orange-50 px-4 py-3 text-sm text-orange-800">{message}</p>}
    </form>
  );
}
