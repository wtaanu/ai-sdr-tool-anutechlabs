"use client";

import { useState } from "react";

export function UnsubscribeForm() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to unsubscribe.");
      }

      setMessage("You have been unsubscribed from marketing communication.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to unsubscribe.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required type="email" value={email} />
      <textarea className="min-h-28 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => setReason(event.target.value)} placeholder="Reason optional" value={reason} />
      <button className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Unsubscribe"}
      </button>
      {message && <p className="rounded-md bg-orange-50 px-4 py-3 text-sm text-orange-800">{message}</p>}
    </form>
  );
}
