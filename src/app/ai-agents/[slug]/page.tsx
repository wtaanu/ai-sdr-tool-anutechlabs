import { notFound } from "next/navigation";
import { SubscribeGate } from "@/components/SubscribeGate";
import { AgentDetailAction } from "@/components/AgentDetailAction";
import { ChatAssistant } from "@/components/ChatAssistant";
import { agents } from "@/data/agents";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getAgentBusinessValue, getAgentExpectations, getAgentProblems, toYouTubeEmbed } from "@/lib/agentDetails";

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

type AgentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = agents.find((item) => item.slug === slug);

  if (!agent) {
    return {};
  }

  return {
    title: `${agent.name} | AI SDR by AnutechLabs`,
    description: agent.outcome
  };
}

export default async function AgentDetailPage({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = agents.find((item) => item.slug === slug);

  if (!agent) {
    notFound();
  }

  let videoUrl = "";
  let videoTitle = "";
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase.from("agent_videos").select("video_url,title").eq("agent_id", agent.id).maybeSingle();
    videoUrl = data?.video_url || "";
    videoTitle = data?.title || `${agent.name} demo`;
  } catch {
    videoUrl = "";
  }
  const youtubeEmbed = videoUrl ? toYouTubeEmbed(videoUrl) : "";
  const problems = getAgentProblems(agent);
  const expectations = getAgentExpectations(agent);

  return (
    <main className="min-h-screen bg-graphite text-white">
      <SubscribeGate />
      <ChatAssistant />
      <section className="code-grid py-16">
        <div className="section-shell">
          <a className="text-sm font-bold text-orange-300" href="/ai-agents">Back to all agents</a>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-orange-500/30 bg-black/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-orange-300">{agent.category}</span>
                <span className="font-mono text-xs text-orange-400">agent::{String(agent.id).padStart(2, "0")}</span>
              </div>
              <h1 className="mt-5 text-5xl font-black leading-tight">{agent.name}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{agent.outcome}</p>
              <div className="mt-8">
                <AgentDetailAction agent={agent} />
              </div>
            </div>

            <div className="rounded-lg border border-orange-500/25 bg-black/45 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">workflow</p>
              <div className="mt-5 space-y-3">
                {agent.workflow.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-md bg-white/[0.04] p-4 font-mono text-sm text-slate-200">
                    <span className="text-orange-400">{index === 0 ? "input" : index === 1 ? "analyze" : "output"}</span>
                    <span className="text-slate-500">::</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              getAgentBusinessValue(agent),
              "Customizable for your industry, niche, tools, language, market, and follow-up process.",
              "Can start as a focused workflow and later grow into a larger AI operating system."
            ].map((item) => (
              <div key={item} className="rounded-lg border border-orange-500/20 bg-[#12151d] p-5">
                <p className="font-mono text-xs text-orange-300">business_value</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>

          {videoUrl && (
            <section className="mt-12 rounded-lg border border-orange-500/25 bg-black/45 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">video_demo</p>
              <h2 className="mt-3 text-2xl font-black text-white">{videoTitle}</h2>
              <div className="mt-5 overflow-hidden rounded-lg border border-orange-500/20 bg-black">
                {youtubeEmbed ? (
                  <iframe
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                    src={youtubeEmbed}
                    title={videoTitle}
                  />
                ) : (
                  <video autoPlay className="aspect-video w-full object-cover" controls loop muted playsInline src={videoUrl} />
                )}
              </div>
            </section>
          )}

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-orange-500/25 bg-black/45 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">problems_solved</p>
              <h2 className="mt-3 text-2xl font-black">What problem it solves</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {problems.map((problem) => (
                  <div key={problem} className="rounded-md bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">{problem}</div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-orange-500/25 bg-black/45 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">what_to_expect</p>
              <h2 className="mt-3 text-2xl font-black">What to expect</h2>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                {expectations.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}
              </ol>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
