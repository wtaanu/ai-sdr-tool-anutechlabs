import { learningVideos } from "@/data/learning";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export type LearningVideo = {
  slug: string;
  title: string;
  description: string;
  youtubeUrl: string;
  embedUrl: string;
  tag: string;
};

export async function getPublishedLearningVideos(): Promise<LearningVideo[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("learning_videos")
      .select("id,title,about,tag,youtube_url,embed_url,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return learningVideos;
    }

    return data.map((video) => ({
      slug: video.id,
      title: video.title,
      description: video.about,
      youtubeUrl: video.youtube_url,
      embedUrl: video.embed_url,
      tag: video.tag || "AI automation"
    }));
  } catch {
    return learningVideos;
  }
}
