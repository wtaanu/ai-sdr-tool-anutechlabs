import { notFound } from "next/navigation";
import { SubscribeGate } from "@/components/SubscribeGate";
import { AgentCard } from "@/components/AgentCard";
import { agents } from "@/data/agents";
import { industries, titleCaseSlug } from "@/data/seo";

type IndustryPageProps = {
  params: Promise<{ industry: string }>;
};

export function generateStaticParams() {
  return industries.map((industry) => ({ industry }));
}

export async function generateMetadata({ params }: IndustryPageProps) {
  const { industry } = await params;
  return {
    title: `AI Agents for ${titleCaseSlug(industry)} | AI SDR by AnutechLabs`,
    description: `Explore AI SDR, lead generation, follow-up, booking, and custom automation agents for ${titleCaseSlug(industry)} businesses.`
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { industry } = await params;
  if (!industries.includes(industry)) notFound();
  const featured = agents.filter((agent) => ["Lead Generation", "Social Media Automation", "Instagram Automation", "Industry Automation", "Email Automation"].includes(agent.category)).slice(0, 9);

  return (
    <main className="min-h-screen bg-graphite text-white">
      <SubscribeGate />
      <section className="code-grid py-16">
        <div className="section-shell">
          <a className="text-sm font-bold text-orange-300" href="/">Back to home</a>
          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight">AI agents for {titleCaseSlug(industry)} businesses</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Verified visitors can explore sales, follow-up, booking, social, and custom workflow agents for {titleCaseSlug(industry)} operations.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
