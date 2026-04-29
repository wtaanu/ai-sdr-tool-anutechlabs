import { SubscribeGate } from "@/components/SubscribeGate";
import { ChatAssistant } from "@/components/ChatAssistant";
import { AgentCatalogue } from "@/components/AgentCatalogue";
import { agents, categories } from "@/data/agents";

export const metadata = {
  title: "50 AI Agents For Business Growth | AI SDR by AnutechLabs",
  description:
    "Explore AI SDR, LinkedIn, Meta, social automation, compliance, finance, SEO, and custom business AI agents."
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-graphite text-white">
      <SubscribeGate />
      <ChatAssistant />
      <section className="code-grid py-16">
        <div className="section-shell">
          <a className="text-sm font-bold text-orange-300" href="/">
            Back to home
          </a>
          <div className="mt-8 max-w-4xl">
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-orange-400">all agents</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">50 AI agents for client acquisition, social automation, compliance, and operations.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Each agent is designed as a business workflow, not just a chatbot. Visitors can select any agent or submit a custom automation request.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-full border border-orange-500/30 bg-black/30 px-3 py-2 text-xs font-bold text-orange-200">
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <AgentCatalogue agents={agents} categories={categories} />
    </main>
  );
}
