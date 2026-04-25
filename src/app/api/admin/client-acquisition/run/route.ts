import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";

const allowedJobs = new Set([
  "import-leads",
  "score-leads",
  "verify-emails",
  "generate-drafts",
  "review-next-50",
  "send-reviewed-drafts",
  "generate-followups",
  "read-inbox-replies",
  "sync-crm-records",
  "weekly-report"
]);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const job = String(body.job || "");

  if (!allowedJobs.has(job)) {
    return NextResponse.json({ error: "Unsupported client acquisition job." }, { status: 400 });
  }

  const apiUrl = process.env.CLIENT_ACQUISITION_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "CLIENT_ACQUISITION_API_URL is not configured." }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/jobs/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job })
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Client acquisition bridge is unavailable."
    }, { status: 500 });
  }
}
