"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublicVideoAdminForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tag, setTag] = useState("AI automation");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveVideo() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/learning/videos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, about, youtubeUrl, tag })
      });
      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) throw new Error(result.error || "Unable to save video.");

      setTitle("");
      setAbout("");
      setYoutubeUrl("");
      setTag("AI automation");
      setMessage("Video saved and published on the public videos page.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save video.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black text-slate-950">Add public YouTube video</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Add videos for everyone. YouTube Shorts and normal YouTube links are converted into embedded players automatically.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setTitle(event.target.value)} placeholder="Video title" value={title} />
        <input className="rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setTag(event.target.value)} placeholder="Tag e.g. AI SDR, Sales, Workflow" value={tag} />
      </div>
      <input className="mt-3 w-full rounded-md border border-slate-300 px-3 py-3 text-sm" onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="YouTube URL e.g. https://youtube.com/shorts/D-MCL_Alf-c?si=..." value={youtubeUrl} />
      <textarea className="mt-3 min-h-28 w-full rounded-md border border-slate-300 px-3 py-3 text-sm leading-6" onChange={(event) => setAbout(event.target.value)} placeholder="About this video. Explain what users will learn and why it matters." value={about} />
      <button className="mt-4 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-400 disabled:opacity-60" disabled={isSaving || !title || !about || !youtubeUrl} onClick={() => void saveVideo()} type="button">
        {isSaving ? "Publishing..." : "Publish video"}
      </button>
      {message && <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}
    </section>
  );
}
