import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { publicVideoSchema } from "@/lib/validators";
import { getYouTubeEmbedUrl, getYouTubeVideoId } from "@/lib/youtube";

function getCookieFromHeader(header: string | null, name: string) {
  if (!header) return undefined;
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cookieName = getAdminCookieName();
  const session = verifyAdminSession(cookieStore.get(cookieName)?.value || getCookieFromHeader(request.headers.get("cookie"), cookieName));

  if (!session) {
    return NextResponse.json({ error: "Admin session expired. Please login again." }, { status: 401 });
  }

  try {
    const body = publicVideoSchema.parse(await request.json());
    const videoId = getYouTubeVideoId(body.youtubeUrl);
    const embedUrl = getYouTubeEmbedUrl(body.youtubeUrl);

    if (!videoId || !embedUrl) {
      return NextResponse.json({ error: "Please enter a valid YouTube video or Shorts URL." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("learning_videos")
      .insert({
        title: body.title,
        about: body.about,
        tag: body.tag || "AI automation",
        youtube_url: body.youtubeUrl,
        youtube_video_id: videoId,
        embed_url: embedUrl,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .select("id,title,about,tag,youtube_url,embed_url,created_at")
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
