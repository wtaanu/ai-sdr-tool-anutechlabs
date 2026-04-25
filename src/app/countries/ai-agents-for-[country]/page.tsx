import { notFound } from "next/navigation";
import { SubscribeGate } from "@/components/SubscribeGate";
import { AgentCard } from "@/components/AgentCard";
import { agents } from "@/data/agents";
import { countries, titleCaseSlug } from "@/data/seo";

type CountryPageProps = {
  params: Promise<{ country: string }>;
};

export function generateStaticParams() {
  return countries.map((country) => ({ country }));
}

export async function generateMetadata({ params }: CountryPageProps) {
  const { country } = await params;
  return {
    title: `AI Agents for ${titleCaseSlug(country)} Businesses | AI SDR by AnutechLabs`,
    description: `AI SDR, client acquisition, LinkedIn, Meta, email, compliance, and custom automation agents for ${titleCaseSlug(country)} clients.`
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country } = await params;
  if (!countries.includes(country)) notFound();
  const featured = agents.slice(0, 12);

  return (
    <main className="min-h-screen bg-graphite text-white">
      <SubscribeGate />
      <section className="code-grid py-16">
        <div className="section-shell">
          <a className="text-sm font-bold text-orange-300" href="/">Back to home</a>
          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight">AI agents for {titleCaseSlug(country)} clients</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            A global AI SDR portal for companies in {titleCaseSlug(country)} searching for lead generation, client acquisition, social automation, compliance, and custom business agents.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
