"use client";

import { useState } from "react";
import type { Agent } from "@/data/agents";
import { AgentInterestModal } from "@/components/AgentInterestModal";

export function AgentDetailAction({ agent }: { agent: Agent }) {
  const [isOpen, setIsOpen] = useState(false);

  function openInterest() {
    setIsOpen(true);
  }

  return (
    <>
      <button className="rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400" onClick={openInterest} type="button">
        Show Interest
      </button>
      {isOpen && <AgentInterestModal agent={agent} onClose={() => setIsOpen(false)} />}
    </>
  );
}
