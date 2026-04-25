import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { agentVideoSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(getAdminCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = agentVideoSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("agent_videos")
      .upsert({
        agent_id: body.agentId,
        video_url: body.videoUrl || null,
        title: body.title || null,
        updated_at: new Date().toISOString()
      })
      .select("agent_id,video_url,title")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, video: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save video.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
