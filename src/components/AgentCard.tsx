"use client";

import { useState } from "react";
import type { Agent } from "@/data/agents";
import { AgentInterestModal } from "@/components/AgentInterestModal";
import { isVisitorVerified, openSubscribeGate } from "@/components/SubscribeGate";
import { getAgentBusinessValue, getAgentProblems } from "@/lib/agentDetails";

export function AgentCard({ agent }: { agent: Agent }) {
  const [isOpen, setIsOpen] = useState(false);

  function showInterest() {
    if (!isVisitorVerified()) {
      openSubscribeGate();
      return;
    }

    setIsOpen(true);
  }

  return (
    <>
      <article className="group flex min-h-[260px] flex-col justify-between rounded-lg border border-orange-500/20 bg-[#12151d] p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-orange-400/70">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-orange-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              {agent.category}
            </span>
            <span className="font-mono text-xs text-orange-400">#{String(agent.id).padStart(2, "0")}</span>
          </div>
          <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{agent.outcome}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-black/35 p-3">
              <p className="font-mono text-xs text-orange-300">business_value</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{getAgentBusinessValue(agent)}</p>
            </div>
            <div className="rounded-md bg-black/35 p-3">
              <p className="font-mono text-xs text-orange-300">solves</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{getAgentProblems(agent).slice(0, 2).join(", ")}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-md bg-black/45 p-4 font-mono text-xs text-slate-300">
          {agent.workflow.map((step, index) => (
            <div key={step} className="flex items-center gap-2 py-1">
              <span className="text-orange-400">{index === 0 ? "input" : index === 1 ? "analyze" : "output"}</span>
              <span className="text-slate-500">::</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <button className="mt-5 rounded-md bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400" onClick={showInterest} type="button">
          Show Interest
        </button>
        <a className="mt-3 block text-center text-xs font-bold text-orange-300 hover:text-orange-200" href={`/ai-agents/${agent.slug}`}>
          View full agent page
        </a>
      </article>
      {isOpen && <AgentInterestModal agent={agent} onClose={() => setIsOpen(false)} />}
    </>
  );
}
