import { agents } from "@/data/agents";
import { LeadStatusControl } from "@/components/AdminActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const stages = ["New Lead", "Qualified", "Call Booked", "Call Done", "Proposal Sent", "Negotiation", "Won", "Lost"];

function getAgentNames(ids: number[]) {
  if (!ids?.length) return "Custom";
  return ids.map((id) => agents.find((agent) => agent.id === id)?.name).filter(Boolean).join(", ");
}

export default async function PipelinePage() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("enquiries")
    .select("id,status,selected_agent_ids,industry,ai_lead_score,public_users(full_name,email,country)")
    .order("created_at", { ascending: false });

  const leads = (data || []) as any[];

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Pipeline</h1>
        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          {stages.map((stage) => (
            <section key={stage} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <h2 className="font-black text-slate-950">{stage}</h2>
              <div className="mt-4 space-y-3">
                {leads.filter((lead) => lead.status === stage).map((lead) => {
                  const user = Array.isArray(lead.public_users) ? lead.public_users[0] : lead.public_users;
                  return (
                    <article key={lead.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="font-bold text-slate-950">{user?.full_name || "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{lead.industry || "-"} · Score {lead.ai_lead_score || 0}</p>
                      <p className="mt-2 text-xs text-slate-600">{getAgentNames(lead.selected_agent_ids)}</p>
                      <div className="mt-3"><LeadStatusControl currentStatus={lead.status} enquiryId={lead.id} /></div>
                      <a className="mt-3 inline-block text-xs font-bold text-orange-600" href={`/admin/leads/${lead.id}`}>Open</a>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
