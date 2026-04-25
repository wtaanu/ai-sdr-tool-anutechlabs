type EmailRecipient = {
  email: string;
  firstName?: string;
  company?: string;
  country?: string;
  persona?: string;
  target?: string;
};

type BrandedEmailInput = {
  to: EmailRecipient[];
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    contentBase64: string;
    contentType: string;
  }>;
  confirmSend?: boolean;
};

export async function sendBrandedEmail(input: BrandedEmailInput) {
  const apiUrl = process.env.CLIENT_ACQUISITION_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001";

  if (!apiUrl) {
    return {
      sent: false,
      status: "draft",
      detail: "CLIENT_ACQUISITION_API_URL is not configured."
    };
  }

  const results = [];

  for (const recipient of input.to) {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "ai_sdr",
        sourceRecordId: `${input.subject}:${recipient.email}`,
        to: recipient,
        subject: input.subject,
        text: input.content,
        html: input.content
          .split("\n")
          .filter(Boolean)
          .map((line) => `<p>${line.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char] || char))}</p>`)
          .join(""),
        attachments: input.attachments,
        recommendedOffer: "AI SDR by AnutechLabs",
        cta: `${siteUrl}/ai-agents`
      })
    });

    const result = await response.json();
    results.push({ ok: response.ok, ...result });
  }

  const sent = results.some((result) => result.sent);
  const queued = results.some((result) => result.queued);
  const failed = results.some((result) => !result.ok);

  return {
    sent,
    status: failed ? "failed" : sent ? "sent" : queued ? "queued" : "draft",
    detail: failed
      ? "Client Acquisition email bridge failed."
      : sent
        ? "Email sent by My Sales Tool."
        : queued
          ? "Email queued in My Sales Tool."
          : "Email processed by My Sales Tool.",
    providerResult: results
  };
}

export function withComplianceFooter(content: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001";

  return `${content}

You can manage communication preferences here:
${siteUrl}/unsubscribe

Privacy and data requests:
${siteUrl}/privacy`;
}
