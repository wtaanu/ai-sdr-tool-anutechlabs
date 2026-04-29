"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  function openChat() {
    setIsOpen(true);
  }

  return (
    <>
      <button
        aria-label="Open AI SDR chat"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/30 hover:bg-orange-400"
        onClick={openChat}
        type="button"
      >
        <Bot size={24} />
      </button>
      {isOpen && (
        <section className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-40px))] rounded-lg border border-orange-500/30 bg-[#0f1115] p-5 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-orange-400">ai sdr chat</p>
              <h2 className="mt-2 text-xl font-black">Agent assistant</h2>
            </div>
            <button className="text-orange-300" onClick={() => setIsOpen(false)} type="button" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 rounded-md bg-black/40 p-4 text-sm leading-6 text-slate-300">
            The live chatbot will connect here once traffic starts converting. For now, use any agent's Show Interest flow or Free Audit to share your requirement.
          </div>
          <a className="mt-4 block rounded-md bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white" href="/ai-agents">
            Explore agents
          </a>
        </section>
      )}
    </>
  );
}
