import { agents, categories } from "@/data/agents";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { AgentVideoForm } from "@/components/AgentVideoForm";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const [{ data }, { data: videos }] = await Promise.all([
    supabase.from("enquiries").select("selected_agent_ids,status"),
    supabase.from("agent_videos").select("agent_id,video_url,title")
  ]);
  const enquiries = (data || []) as { selected_agent_ids: number[]; status: string }[];
  const videoMap = new Map((videos || []).map((video) => [video.agent_id, video]));

  const stats = agents.map((agent) => {
    const matching = enquiries.filter((enquiry) => enquiry.selected_agent_ids?.includes(agent.id));
    return {
      ...agent,
      enquiries: matching.length,
      won: matching.filter((item) => item.status === "Won").length,
      calls: matching.filter((item) => ["Call Booked", "Call Done", "Proposal Sent", "Negotiation", "Won"].includes(item.status)).length
    };
  });

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Agent Manager</h1>
        <p className="mt-2 text-sm text-slate-600">The public catalogue is currently powered by the static 50-agent dataset. This page shows performance and publishing readiness.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{category}</span>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((agent) => (
            <article key={agent.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">{agent.category}</p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">{agent.name}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Live</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{agent.outcome}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-orange-50 p-3"><p className="text-xl font-black text-orange-700">{agent.enquiries}</p><p className="text-xs text-orange-700">Enquiries</p></div>
                <div className="rounded-md bg-slate-50 p-3"><p className="text-xl font-black text-slate-950">{agent.calls}</p><p className="text-xs text-slate-500">Calls</p></div>
                <div className="rounded-md bg-slate-50 p-3"><p className="text-xl font-black text-slate-950">{agent.won}</p><p className="text-xs text-slate-500">Won</p></div>
              </div>
              <a className="mt-5 inline-block text-sm font-bold text-orange-600" href={`/ai-agents/${agent.slug}`}>View public page</a>
              <AgentVideoForm agentId={agent.id} initialTitle={videoMap.get(agent.id)?.title || ""} initialUrl={videoMap.get(agent.id)?.video_url || ""} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
