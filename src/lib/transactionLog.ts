import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type LogInput = {
  traceId: string;
  level?: "info" | "warn" | "error";
  eventName: string;
  route?: string;
  userId?: string;
  email?: string;
  status?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
};

export function createTraceId(prefix = "trace") {
  return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

export async function logTransaction(input: LogInput) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("transaction_logs").insert({
      trace_id: input.traceId,
      level: input.level || "info",
      event_name: input.eventName,
      route: input.route || null,
      user_id: input.userId || null,
      email: input.email || null,
      status: input.status || null,
      detail: input.detail || null,
      metadata: input.metadata || {}
    });
  } catch (error) {
    console.error("transaction log failed", error);
  }
}
