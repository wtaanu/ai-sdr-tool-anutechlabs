import { NextResponse } from "next/server";
import { agents } from "@/data/agents";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { agentInterestOpenSchema } from "@/lib/validators";
import { createTraceId, logTransaction } from "@/lib/transactionLog";

export async function POST(request: Request) {
  const traceId = createTraceId("agent_interest_opened");

  try {
    const body = agentInterestOpenSchema.parse(await request.json());
    const agent = agents.find((item) => item.id === body.agentId);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: user, error: userError } = await supabase
      .from("public_users")
      .select("id,email,full_name,is_email_verified")
      .eq("id", body.userId)
      .eq("is_email_verified", true)
      .maybeSingle();

    if (userError || !user) {
      await logTransaction({ traceId, level: "warn", eventName: "agent_interest_open_unverified", route: "/api/agent-interest-events", userId: body.userId, status: "blocked" });
      return NextResponse.json({ error: "Verified profile not found." }, { status: 403 });
    }

    const followupDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data: event, error: eventError } = await supabase
      .from("agent_interest_events")
      .insert({
        user_id: body.userId,
        agent_id: agent.id,
        agent_name: agent.name,
        agent_slug: agent.slug,
        page_url: body.pageUrl || `/ai-agents/${agent.slug}`,
        status: "opened",
        followup_due_at: followupDueAt
      })
      .select("id,followup_due_at")
      .single();

    if (eventError) {
      await logTransaction({ traceId, level: "error", eventName: "agent_interest_open_insert_failed", route: "/api/agent-interest-events", userId: body.userId, email: user.email, status: "failed", detail: eventError.message });
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    await supabase.from("activity_timeline").insert({
      user_id: body.userId,
      activity_type: "agent_interest_opened",
      details: {
        eventId: event.id,
        agentId: agent.id,
        agentName: agent.name,
        agentSlug: agent.slug,
        followupDueAt
      }
    });

    await logTransaction({ traceId, eventName: "agent_interest_opened", route: "/api/agent-interest-events", userId: body.userId, email: user.email, status: "completed", metadata: { eventId: event.id, agentId: agent.id } });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log agent interest.";
    await logTransaction({ traceId, level: "error", eventName: "agent_interest_open_failed", route: "/api/agent-interest-events", status: "failed", detail: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
