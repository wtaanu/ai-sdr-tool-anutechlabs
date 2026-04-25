import { notFound } from "next/navigation";
import { SubscribeGate } from "@/components/SubscribeGate";
import { ChatAssistant } from "@/components/ChatAssistant";
import { FreeAuditPanel } from "@/components/FreeAuditPanel";
import { agents } from "@/data/agents";
import { longTailSeoPages } from "@/data/seo";

export function generateStaticParams() {
  return longTailSeoPages.map((page) => ({ slug: page.slug }));
}

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SolutionPageProps) {
  const { slug } = await params;
  const page = longTailSeoPages.find((item) => item.slug === slug);
  if (!page) return {};

  return {
    title: `${page.title} | AI SDR by AnutechLabs`,
    description: page.description
  };
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { slug } = await params;
  const page = longTailSeoPages.find((item) => item.slug === slug);

  if (!page) {
    notFound();
  }

  const recommendedAgents = page.agentIds
    .map((id) => agents.find((agent) => agent.id === id))
    .filter(Boolean);

  return (
    <main className="bg-white">
      <SubscribeGate />
      <ChatAssistant />
      <section className="bg-mist py-16">
        <div className="section-shell">
          <a className="text-sm font-bold text-orange-600" href="/">AI SDR by AnutechLabs</a>
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">AI automation solution</p>
            <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950">{page.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white" href="#free-audit">Get free audit today</a>
              <a className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800" href="/ai-agents">Explore all agents</a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black text-slate-950">Why this workflow matters</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Businesses searching for {page.useCase} usually need more than one tool. The right AI agent should capture clean data, understand context, trigger follow-up, and keep every step measurable inside an admin dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              `Built for ${page.industry}`,
              `Focused on ${page.useCase}`,
              "Verified lead capture and consent logging",
              "AI recommendation report and call booking path"
            ].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <p className="font-bold text-slate-950">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="code-grid bg-graphite py-16 text-white">
        <div className="section-shell">
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-orange-400">recommended agents</p>
          <h2 className="mt-3 text-4xl font-black">Best-fit AI agents for this search</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recommendedAgents.map((agent) => agent && (
              <a key={agent.id} className="rounded-lg border border-orange-500/25 bg-black/35 p-5" href={`/ai-agents/${agent.slug}`}>
                <p className="font-mono text-xs text-orange-300">agent::{String(agent.id).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-black text-white">{agent.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.outcome}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FreeAuditPanel />
    </main>
  );
}
