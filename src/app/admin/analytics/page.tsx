import { agents } from "@/data/agents";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const [{ data: enquiries }, { data: users }, { data: bookings }] = await Promise.all([
    supabase.from("enquiries").select("selected_agent_ids,status,industry,target_market,ai_lead_score"),
    supabase.from("public_users").select("country,is_email_verified"),
    supabase.from("bookings").select("status")
  ]);

  const enquiryRows = (enquiries || []) as any[];
  const userRows = (users || []) as any[];
  const bookingRows = (bookings || []) as any[];
  const topAgents = agents
    .map((agent) => ({
      name: agent.name,
      count: enquiryRows.filter((row) => row.selected_agent_ids?.includes(agent.id)).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const countries = Object.entries(userRows.reduce((acc: Record<string, number>, row) => {
    acc[row.country || "Unknown"] = (acc[row.country || "Unknown"] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const averageScore = enquiryRows.length
    ? Math.round(enquiryRows.reduce((sum, row) => sum + (row.ai_lead_score || 0), 0) / enquiryRows.length)
    : 0;

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Analytics</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-5 shadow-soft"><p className="text-sm text-slate-500">Verified users</p><p className="mt-2 text-3xl font-black">{userRows.filter((u) => u.is_email_verified).length}</p></div>
          <div className="rounded-lg bg-white p-5 shadow-soft"><p className="text-sm text-slate-500">Enquiries</p><p className="mt-2 text-3xl font-black">{enquiryRows.length}</p></div>
          <div className="rounded-lg bg-white p-5 shadow-soft"><p className="text-sm text-slate-500">Bookings</p><p className="mt-2 text-3xl font-black">{bookingRows.length}</p></div>
          <div className="rounded-lg bg-white p-5 shadow-soft"><p className="text-sm text-slate-500">Avg score</p><p className="mt-2 text-3xl font-black">{averageScore}</p></div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Top agents</h2>
            <div className="mt-5 space-y-3">
              {topAgents.map((agent) => <div key={agent.name} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm"><span>{agent.name}</span><strong>{agent.count}</strong></div>)}
            </div>
          </section>
          <section className="rounded-lg bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Top countries</h2>
            <div className="mt-5 space-y-3">
              {countries.map(([country, count]) => <div key={country} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm"><span>{country}</span><strong>{count}</strong></div>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
