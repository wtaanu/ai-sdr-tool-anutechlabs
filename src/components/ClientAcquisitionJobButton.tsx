"use client";

import { useState } from "react";

export function ClientAcquisitionJobButton({ job }: { job: string }) {
  const [message, setMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function runJob() {
    setIsRunning(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/client-acquisition/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job })
      });
      const result = await response.json();
      setMessage(response.ok ? "Done" : result.error || "Failed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="mt-3">
      <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600" disabled={isRunning} onClick={() => void runJob()} type="button">
        {isRunning ? "Running..." : "Run"}
      </button>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </div>
  );
}
