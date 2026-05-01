import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("email_logs")
    .select("id,email_type,subject,status,provider_message_id,sent_at,created_at,public_users(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const emails = (data || []) as any[];

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Email Center</h1>
        <p className="mt-2 text-sm text-slate-600">OTP, confirmations, owner notifications, booking alerts, and draft follow-ups.</p>
        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Lead</th>
                <th className="p-4">Status</th>
                <th className="p-4">Provider detail</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => {
                const user = Array.isArray(email.public_users) ? email.public_users[0] : email.public_users;
                return (
                  <tr key={email.id} className="border-b border-slate-100 align-top">
                    <td className="p-4 font-bold text-slate-950">{email.email_type}</td>
                    <td className="max-w-[280px] p-4 text-slate-700">{email.subject || "-"}</td>
                    <td className="p-4 text-slate-600">{user?.full_name || "-"}<br /><span className="text-xs text-slate-500">{user?.email}</span></td>
                    <td className="p-4"><span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{email.status}</span></td>
                    <td className="max-w-[260px] p-4 text-xs text-slate-500">{email.provider_message_id || "-"}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(email.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {!emails.length && (
                <tr><td className="p-8 text-center text-slate-500" colSpan={6}>No email logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
