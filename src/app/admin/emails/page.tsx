import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  await requireAdminSession();
  const supabase = getSupabaseAdminClient();
  const [websiteEmailsResult, outreachEmailsResult] = await Promise.all([
    supabase
      .from("email_logs")
      .select("id,email_type,subject,status,provider_message_id,sent_at,created_at,public_users(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("sales_email_drafts")
      .select("id,mail_type,sequence_step,subject_line,email_body_text,email_body_html,preview_html,draft_status,send_result,provider_message_id,sent_at,updated_at,sales_prospects(company_name,buyer_name,email,segment,prospect_status,next_followup_at,followup_count)")
      .order("updated_at", { ascending: false })
      .limit(200)
  ]);

  const websiteEmails = ((websiteEmailsResult.data || []) as any[]).map((email) => {
    const user = Array.isArray(email.public_users) ? email.public_users[0] : email.public_users;
    return {
      id: `website-${email.id}`,
      source: "Website",
      type: email.email_type,
      subject: email.subject || "-",
      leadName: user?.full_name || "-",
      leadEmail: user?.email || "-",
      status: email.status,
      provider: email.provider_message_id || "-",
      sentAt: email.sent_at,
      createdAt: email.created_at,
      previewHtml: "",
      bodyText: "",
      nextFollowupAt: null,
      followupCount: 0
    };
  });

  const outreachEmails = ((outreachEmailsResult.data || []) as any[]).map((draft) => {
    const prospect = Array.isArray(draft.sales_prospects) ? draft.sales_prospects[0] : draft.sales_prospects;
    return {
      id: `outreach-${draft.id}`,
      source: "Client Acquisition",
      type: `${draft.mail_type || "outreach"} / step ${draft.sequence_step || 1}`,
      subject: draft.subject_line || "-",
      leadName: prospect?.buyer_name || prospect?.company_name || "-",
      leadEmail: prospect?.email || "-",
      status: draft.send_result || draft.draft_status,
      provider: draft.provider_message_id || "-",
      sentAt: draft.sent_at,
      createdAt: draft.updated_at,
      previewHtml: draft.preview_html || draft.email_body_html || "",
      bodyText: draft.email_body_text || "",
      nextFollowupAt: prospect?.next_followup_at,
      followupCount: prospect?.followup_count || 0
    };
  });

  const emails = [...websiteEmails, ...outreachEmails].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <main className="min-h-screen bg-mist p-6 lg:p-8">
      <section className="section-shell">
        <a className="text-sm font-bold text-orange-600" href="/admin">Back to dashboard</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Email Center</h1>
        <p className="mt-2 text-sm text-slate-600">OTP, confirmations, owner notifications, client acquisition sends, previews, and follow-ups.</p>
        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="p-4">Source</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Lead</th>
                <th className="p-4">Status</th>
                <th className="p-4">Provider detail</th>
                <th className="p-4">Preview</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                  <tr key={email.id} className="border-b border-slate-100 align-top">
                    <td className="p-4 font-bold text-orange-700">{email.source}</td>
                    <td className="p-4 font-bold text-slate-950">{email.type}</td>
                    <td className="max-w-[280px] p-4 text-slate-700">{email.subject}</td>
                    <td className="p-4 text-slate-600">{email.leadName}<br /><span className="text-xs text-slate-500">{email.leadEmail}</span></td>
                    <td className="p-4"><span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{email.status}</span></td>
                    <td className="max-w-[220px] p-4 text-xs text-slate-500">{email.provider}</td>
                    <td className="max-w-[360px] p-4 text-xs leading-5 text-slate-600">
                      {email.previewHtml ? (
                        <details>
                          <summary className="cursor-pointer font-bold text-orange-700">Open preview</summary>
                          <div className="mt-3 rounded-md border border-slate-200 bg-white p-3" dangerouslySetInnerHTML={{ __html: email.previewHtml }} />
                        </details>
                      ) : email.bodyText ? (
                        <details>
                          <summary className="cursor-pointer font-bold text-orange-700">Open text</summary>
                          <pre className="mt-3 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 font-sans">{email.bodyText}</pre>
                        </details>
                      ) : "-"}
                      {email.nextFollowupAt && <p className="mt-2 text-[11px] font-bold text-slate-500">Next follow-up: {new Date(email.nextFollowupAt).toLocaleString()}</p>}
                    </td>
                    <td className="p-4 text-xs text-slate-500">{new Date(email.createdAt).toLocaleString()}</td>
                  </tr>
              ))}
              {!emails.length && (
                <tr><td className="p-8 text-center text-slate-500" colSpan={8}>No email logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
