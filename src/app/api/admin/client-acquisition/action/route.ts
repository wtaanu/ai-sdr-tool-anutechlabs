import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

const allowedActions: Record<string, string> = {
  migrateProspects: "/api/prospects/migrate-sheets",
  generateProspects: "/api/prospects/generate",
  importApolloCsvRows: "local",
  createManualProspect: "/api/prospects/manual",
  purgeFailedProspects: "/api/prospects/purge-failed",
  generateDrafts: "/api/campaigns/generate-drafts",
  reviewDraft: "/api/drafts/review",
  sendDraft: "/api/drafts/send",
  updateProspectStatus: "local",
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

function manualLeadId(companyName: string, email: string) {
  const base = `${companyName || "manual"}_${email}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `manual_${base || Date.now()}`;
}

function csvLeadId(row: Record<string, unknown>, index: number) {
  const apolloId = String(row["Apollo Account Id"] || row["Apollo Contact Id"] || row["Person Linkedin Url"] || row["Company Linkedin Url"] || "").trim();
  const companyName = String(row["Company Name"] || row.company_name || "").trim();
  const email = String(row.Email || row.email || "").trim().toLowerCase();
  const base = `${apolloId || companyName || email || index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `apollo_csv_${base || index}`;
}

function stringValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

async function importApolloCsvRows(payload: Record<string, unknown>) {
  const rows = Array.isArray(payload.rows) ? payload.rows.slice(0, 2000) as Record<string, unknown>[] : [];

  if (!rows.length) {
    return NextResponse.json({ error: "No CSV rows received." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const recordsByLeadId = new Map<string, Record<string, unknown>>();
  const duplicateRows = { count: 0 };
  const missingEmailRows = { count: 0 };
  rows
    .map((row, index) => {
      const companyName = stringValue(row, ["Company Name", "Company", "company_name", "Organization Name"]);
      const email = stringValue(row, ["Email", "email", "Work Email"]).toLowerCase();
      const buyerName = stringValue(row, ["Name", "Person Name", "Full Name", "First Name"]);
      const buyerTitle = stringValue(row, ["Title", "Job Title", "buyer_title"]);
      const website = stringValue(row, ["Website", "Company Website", "website"]);
      const linkedinUrl = stringValue(row, ["Company Linkedin Url", "LinkedIn", "Company LinkedIn", "Person Linkedin Url"]);
      const industry = stringValue(row, ["Industry", "industry"]);
      const country = stringValue(row, ["Company Country", "Country", "country"]);
      const employees = stringValue(row, ["# Employees", "Employees", "employee_count"]);
      const revenue = stringValue(row, ["Annual Revenue", "Revenue"]);
      const technologies = stringValue(row, ["Technologies", "tech_stack"]);
      const keywords = stringValue(row, ["Keywords", "Primary Intent Topic", "Secondary Intent Topic"]);
      const shortDescription = stringValue(row, ["Short Description", "Description", "pain_notes"]);
      const fitScore = Number(stringValue(row, ["Account Fit Score 2887 0504045328", "Account Fit Score", "Fit Score"]) || 0);

      if (!companyName && !email && !website) return null;
      if (!email) {
        missingEmailRows.count += 1;
        return null;
      }

      return {
        lead_id: csvLeadId(row, index),
        segment: String(payload.segment || "apollo_csv_accounts"),
        company_name: companyName || null,
        buyer_name: buyerName || null,
        buyer_title: buyerTitle || null,
        email,
        country: country || null,
        industry: industry || null,
        employee_count: employees || null,
        website: website || null,
        linkedin_url: linkedinUrl || null,
        source: "apollo_api",
        recent_signal: keywords || "Apollo CSV import",
        pain_notes: shortDescription || null,
        tech_stack: technologies || null,
        recommended_offer: null,
        pitch_angle: revenue ? `Company revenue signal: ${revenue}` : null,
        roi_reason: null,
        lead_score: Number.isFinite(fitScore) ? fitScore : 0,
        fit_score: Number.isFinite(fitScore) ? fitScore : null,
        verification_status: "pending",
        verification_notes: "Imported from Apollo CSV.",
        prospect_status: "new",
        raw_payload: row,
        updated_at: now
      };
    })
    .filter(Boolean)
    .forEach((record: any) => {
      if (recordsByLeadId.has(record.lead_id)) duplicateRows.count += 1;
      recordsByLeadId.set(record.lead_id, record);
    });
  const records = Array.from(recordsByLeadId.values());

  if (!records.length) {
    return NextResponse.json({ error: "CSV did not contain usable company or email rows." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sales_prospects")
    .upsert(records, { onConflict: "lead_id" })
    .select("id,lead_id,email,company_name,source");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imported: data?.length || 0, count: data?.length || 0, source: "apollo_api", missingEmail: missingEmailRows.count, duplicatesInCsv: duplicateRows.count });
}

async function createManualProspect(payload: Record<string, unknown>) {
  const email = String(payload.email || "").trim().toLowerCase();
  const companyName = String(payload.companyName || "").trim();
  const leadScore = Number(payload.leadScore || 0);

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const prospectStatus = String(payload.prospectStatus || (leadScore > 0 ? "scored" : "new"));
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sales_prospects")
    .upsert(
      {
        lead_id: String(payload.leadId || manualLeadId(companyName, email)),
        segment: String(payload.segment || "general_b2b"),
        company_name: companyName || null,
        buyer_name: String(payload.buyerName || "").trim() || null,
        buyer_title: String(payload.buyerTitle || "").trim() || null,
        email,
        country: String(payload.country || "").trim() || null,
        industry: String(payload.industry || "").trim() || null,
        website: String(payload.website || "").trim() || null,
        source: "manual_admin",
        pain_notes: String(payload.notes || "").trim() || null,
        notes: String(payload.notes || "").trim() || null,
        lead_score: Number.isFinite(leadScore) ? leadScore : 0,
        prospect_status: prospectStatus,
        raw_payload: payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: "lead_id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prospect: data, count: 1 });
}

async function updateProspectStatus(payload: Record<string, unknown>) {
  const ids = Array.isArray(payload.prospectIds) ? payload.prospectIds.map(String).filter(Boolean) : [];
  const prospectStatus = String(payload.prospectStatus || "").trim();

  if (!ids.length) {
    return NextResponse.json({ error: "Select at least one lead first." }, { status: 400 });
  }

  if (!["new", "scored", "verified", "sent", "failed", "replied"].includes(prospectStatus)) {
    return NextResponse.json({ error: "Unsupported prospect status." }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {
    prospect_status: prospectStatus,
    updated_at: new Date().toISOString()
  };

  if (prospectStatus === "verified") {
    updatePayload.verification_status = "approved_for_review";
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sales_prospects")
    .update(updatePayload)
    .in("id", ids)
    .select("id,email,prospect_status");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: data?.length || 0, prospects: data || [] });
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

  if (body.action === "createManualProspect") {
    await logTransaction({ traceId, eventName: "manual_sales_prospect_started", route: "/api/admin/client-acquisition/action", email: session.email, status: "started" });
    const response = await createManualProspect(body.payload || {});
    await logTransaction({ traceId, eventName: "manual_sales_prospect_completed", route: "/api/admin/client-acquisition/action", email: session.email, status: response.ok ? "completed" : "failed", metadata: { statusCode: response.status } });
    const result = await response.json();
    return NextResponse.json({ ...result, traceId }, { status: response.status });
  }

  if (body.action === "importApolloCsvRows") {
    await logTransaction({ traceId, eventName: "apollo_csv_import_started", route: "/api/admin/client-acquisition/action", email: session.email, status: "started", metadata: { rowCount: body.payload?.rows?.length || 0 } });
    const response = await importApolloCsvRows(body.payload || {});
    const result = await response.json();
    await logTransaction({ traceId, eventName: "apollo_csv_import_completed", route: "/api/admin/client-acquisition/action", email: session.email, status: response.ok ? "completed" : "failed", detail: result.error, metadata: { statusCode: response.status, imported: result.imported } });
    return NextResponse.json({ ...result, traceId }, { status: response.status });
  }

  if (body.action === "updateProspectStatus") {
    await logTransaction({ traceId, eventName: "sales_prospect_status_started", route: "/api/admin/client-acquisition/action", email: session.email, status: "started", metadata: { payload: body.payload } });
    const response = await updateProspectStatus(body.payload || {});
    await logTransaction({ traceId, eventName: "sales_prospect_status_completed", route: "/api/admin/client-acquisition/action", email: session.email, status: response.ok ? "completed" : "failed", metadata: { statusCode: response.status } });
    const result = await response.json();
    return NextResponse.json({ ...result, traceId }, { status: response.status });
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
