import { LeadStatusControl } from "@/components/AdminActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function CustomRequestsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("enquiries")
    .select("id,custom_requirement,automation_goal,industry,business_type,ai_lead_score,ai_priority,status,public_users(full_name,email,country)")
    .or("custom_requirement.not.is.null,selected_agent_ids.eq.{}")
    .order("created_at", { ascending: false });

  const requests = (data || []) as any[];

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Custom Agent Requests</h1>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {requests.map((request) => {
            const user = Array.isArray(request.public_users) ? request.public_users[0] : request.public_users;
            return (
              <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">{request.industry || "Custom workflow"}</p>
                    <h2 className="mt-2 text-xl font-black text-slate-950">{user?.full_name || "Unknown lead"}</h2>
                    <p className="mt-1 text-xs text-slate-500">{user?.email} · {user?.country}</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">{request.ai_priority || "Review"} · {request.ai_lead_score || 0}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{request.custom_requirement || request.automation_goal}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <LeadStatusControl currentStatus={request.status} enquiryId={request.id} />
                  <a className="rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white" href={`/admin/leads/${request.id}`}>Open</a>
                </div>
              </article>
            );
          })}
          {!requests.length && <p className="text-sm text-slate-500">No custom agent requests yet.</p>}
        </div>
      </section>
    </main>
  );
}
