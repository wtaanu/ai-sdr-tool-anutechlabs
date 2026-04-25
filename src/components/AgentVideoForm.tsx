"use client";

import { useState } from "react";

export function AgentVideoForm({ agentId, initialUrl, initialTitle }: { agentId: number; initialUrl?: string; initialTitle?: string }) {
  const [videoUrl, setVideoUrl] = useState(initialUrl || "");
  const [title, setTitle] = useState(initialTitle || "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveVideo() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/agents/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, videoUrl, title })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save video.");
      setMessage("Video saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save video.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-5 rounded-md bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">demo video</p>
      <input className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-orange-500" onChange={(event) => setTitle(event.target.value)} placeholder="Video title" value={title} />
      <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-orange-500" onChange={(event) => setVideoUrl(event.target.value)} placeholder="YouTube URL or direct MP4/WebM video URL" value={videoUrl} />
      <button className="mt-3 rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600" disabled={isSaving} onClick={() => void saveVideo()} type="button">
        {isSaving ? "Saving..." : "Save video"}
      </button>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </div>
  );
}
