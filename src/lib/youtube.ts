export function getYouTubeVideoId(url: string) {
  const value = String(url || "").trim();
  if (!value) return "";

  const patterns = [
    /youtube\.com\/shorts\/([^?&#/]+)/i,
    /youtube\.com\/watch\?v=([^?&#/]+)/i,
    /youtu\.be\/([^?&#/]+)/i,
    /youtube\.com\/embed\/([^?&#/]+)/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

export function getYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}
