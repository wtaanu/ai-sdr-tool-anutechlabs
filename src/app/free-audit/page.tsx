import { ArrowRight, Bot, Home } from "lucide-react";
import { SubscribeGate } from "@/components/SubscribeGate";
import { ChatAssistant } from "@/components/ChatAssistant";
import { FreeAuditPanel } from "@/components/FreeAuditPanel";
import { PolicyLinks } from "@/components/PolicyModal";

export const metadata = {
  title: "Free AI Automation Audit | AI SDR by AnutechLabs",
  description: "Get a free AI automation audit with ROI direction, recommended agents, roadmap, and PDF report."
};

export default function FreeAuditLandingPage() {
  return (
    <main className="bg-white">
      <SubscribeGate />
      <ChatAssistant />
      <header className="border-b border-slate-200 bg-white">
        <div className="section-shell flex min-h-20 flex-col justify-center gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-black text-slate-950" href="/">AI SDR by AnutechLabs</a>
          <div className="flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800" href="/">
              <Home size={16} /> Website
            </a>
            <a className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white" href="/ai-agents">
              <Bot size={16} /> Explore agents
            </a>
          </div>
        </div>
      </header>

      <section className="bg-mist py-16">
        <div className="section-shell max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">LinkedIn visitor offer</p>
          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950">Get your free AI automation audit today.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Share your business workflow and get an instant AI report with recommended agents, revenue improvement ideas, ROI direction, quick wins, and a PDF copy in your inbox.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white" href="#free-audit">
              Start free audit <ArrowRight size={16} />
            </a>
            <a className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800" href="/ai-agents">
              See all 50 agents
            </a>
          </div>
        </div>
      </section>

      <FreeAuditPanel />

      <section className="bg-graphite py-14 text-white">
        <div className="section-shell grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <h2 className="text-3xl font-black">After your report, choose an agent or request a custom build.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Your audit report will show the best-fit agents. You can then explore the website, watch agent demos, or book a call to build the workflow around your business.
            </p>
          </div>
          <a className="rounded-md bg-orange-500 px-5 py-3 text-center text-sm font-black text-white" href="/ai-agents">
            Go to AI agents
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="section-shell flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <p className="font-semibold text-slate-800">AI SDR by AnutechLabs</p>
          <PolicyLinks />
        </div>
      </footer>
    </main>
  );
}
