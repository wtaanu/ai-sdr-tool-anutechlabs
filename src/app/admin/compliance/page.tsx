import { DataRequestStatusControl } from "@/components/AdminActions";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const [{ data: requests }, { data: suppressions }, { data: audits }, { data: consents }] = await Promise.all([
    supabase.from("data_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("email_suppressions").select("*").order("created_at", { ascending: false }),
    supabase
      .from("free_audit_requests")
      .select("id,industry,business_type,opportunity_score,roi_potential,email_status,created_at,public_users(full_name,email,country)")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("consent_logs").select("id,consent_type,status,country,created_at").order("created_at", { ascending: false }).limit(20)
  ]);

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Compliance Center</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          {[
            ["Data requests", requests?.length || 0],
            ["Unsubscribed", suppressions?.length || 0],
            ["Free audits", audits?.length || 0],
            ["Recent consents", consents?.length || 0]
          ].map(([label, value]) => (
            <article key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{String(value)}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Data requests</h2>
            <div className="mt-5 space-y-4">
              {(requests || []).map((request) => (
                <article key={request.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{request.full_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.email} · {request.country}</p>
                  <p className="mt-3 text-sm text-slate-700">{request.request_type}</p>
                  <p className="mt-2 text-xs text-slate-500">{request.details || "No details"}</p>
                  <div className="mt-3"><DataRequestStatusControl currentStatus={request.status} requestId={request.id} /></div>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Unsubscribed users</h2>
            <div className="mt-5 space-y-3">
              {(suppressions || []).map((item) => (
                <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-bold text-slate-950">{item.email}</p>
                  <p className="text-xs text-slate-500">{item.reason || "unsubscribe"} · {item.source}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Free audit logs</h2>
            <div className="mt-5 space-y-4">
              {(audits || []).map((audit) => {
                const user = Array.isArray(audit.public_users) ? audit.public_users[0] : audit.public_users;
                return (
                  <article key={audit.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-slate-950">{user?.full_name || "Verified user"}</p>
                        <p className="mt-1 text-xs text-slate-500">{user?.email || "-"} · {user?.country || "-"}</p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                        {audit.opportunity_score || 0}/100
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{audit.industry} · {audit.business_type}</p>
                    <p className="mt-2 text-xs text-slate-500">ROI: {audit.roi_potential || "-"} · Email: {audit.email_status || "pending"}</p>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Recent consent logs</h2>
            <div className="mt-5 space-y-3">
              {(consents || []).map((item) => (
                <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-bold text-slate-950">{item.consent_type}</p>
                  <p className="text-xs text-slate-500">{item.status} · {item.country || "-"} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
