import { EmailCenterTable } from "@/components/EmailCenterTable";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function EmailsPage({ searchParams }: { searchParams?: Promise<{ status?: string; source?: string }> }) {
  await requireAdminSession();
  const params = searchParams ? await searchParams : {};
  const supabase = getSupabaseAdminClient();
  const [websiteEmailsResult, outreachEmailsResult] = await Promise.all([
    supabase
      .from("email_logs")
      .select("id,email_type,subject,status,provider_message_id,sent_at,created_at,public_users(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("sales_email_drafts")
      .select("id,mail_type,sequence_step,subject_line,email_body_text,email_body_html,preview_html,draft_status,send_result,provider_message_id,sent_at,updated_at,sales_prospects(company_name,buyer_name,email,segment,prospect_status,next_followup_at,followup_count)")
      .order("updated_at", { ascending: false })
      .limit(1000)
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
        <EmailCenterTable emails={emails} initialSource={params.source || "All"} initialStatus={params.status || "All"} />
      </section>
    </main>
  );
}
