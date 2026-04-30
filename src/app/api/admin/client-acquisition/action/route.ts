import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

const allowedActions: Record<string, string> = {
  migrateProspects: "/api/prospects/migrate-sheets",
  generateProspects: "/api/prospects/generate",
  createManualProspect: "/api/prospects/manual",
  purgeFailedProspects: "/api/prospects/purge-failed",
  generateDrafts: "/api/campaigns/generate-drafts",
  reviewDraft: "/api/drafts/review",
  sendDraft: "/api/drafts/send",
  createSegment: "/api/segments"
};

function getCookieFromHeader(header: string | null, name: string) {
  if (!header) return undefined;
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  const traceId = createTraceId("sales_bridge");
  const cookieStore = await cookies();
  const cookieName = getAdminCookieName();
  const token = cookieStore.get(cookieName)?.value || getCookieFromHeader(request.headers.get("cookie"), cookieName);
  const session = verifyAdminSession(token);

  if (!session) {
    await logTransaction({ traceId, level: "warn", eventName: "sales_bridge_unauthorized", route: "/api/admin/client-acquisition/action", status: "blocked", metadata: { hasCookieHeader: Boolean(request.headers.get("cookie")), hasCookieStoreToken: Boolean(cookieStore.get(cookieName)?.value) } });
    return NextResponse.json({ error: "Admin session expired. Please login again and retry the sync.", traceId }, { status: 401 });
  }

  const body = await request.json();
  const path = allowedActions[body.action];
  const apiUrl = process.env.CLIENT_ACQUISITION_API_URL;

  if (!path) {
    await logTransaction({ traceId, level: "warn", eventName: "sales_bridge_bad_action", route: "/api/admin/client-acquisition/action", email: session.email, status: "blocked", metadata: { action: body.action } });
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  if (!apiUrl) {
    await logTransaction({ traceId, level: "error", eventName: "sales_bridge_missing_url", route: "/api/admin/client-acquisition/action", email: session.email, status: "failed" });
    return NextResponse.json({ error: "CLIENT_ACQUISITION_API_URL is not configured." }, { status: 500 });
  }

  try {
    await logTransaction({ traceId, eventName: "sales_bridge_started", route: "/api/admin/client-acquisition/action", email: session.email, status: "started", metadata: { action: body.action, bridgePath: path } });
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.payload || {})
    });
    const result = await response.json();
    await logTransaction({ traceId, level: response.ok ? "info" : "error", eventName: "sales_bridge_completed", route: "/api/admin/client-acquisition/action", email: session.email, status: response.ok ? "completed" : "failed", detail: result.error, metadata: { action: body.action, statusCode: response.status } });
    return NextResponse.json({ ...result, traceId }, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Client acquisition bridge failed.";
    await logTransaction({ traceId, level: "error", eventName: "sales_bridge_failed", route: "/api/admin/client-acquisition/action", email: session.email, status: "failed", detail: message });
    return NextResponse.json({ error: message, traceId }, { status: 500 });
  }
}
