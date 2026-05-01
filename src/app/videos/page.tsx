import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import { ChatAssistant } from "@/components/ChatAssistant";
import { learningBlogs } from "@/data/learning";
import { getPublishedLearningVideos } from "@/lib/learningVideos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "AI Agent Videos | AI SDR by AnutechLabs",
  description:
    "Watch AI SDR by AnutechLabs videos and demos for AI agents, client acquisition automation, lead follow-up, and custom business workflows.",
  keywords: [
    "AI agent videos",
    "AI SDR demo",
    "client acquisition automation video",
    "AI automation videos",
    "AnutechLabs videos"
  ],
  alternates: {
    canonical: "/videos"
  }
};

export default async function VideosPage() {
  const videos = await getPublishedLearningVideos();

  return (
    <main className="bg-white">
      <ChatAssistant />
      <header className="border-b border-slate-200 bg-white">
        <div className="section-shell flex min-h-20 flex-col justify-center gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-black text-slate-950" href="/">AI SDR by AnutechLabs</a>
          <nav className="flex flex-wrap gap-3 text-sm font-bold">
            <a className="rounded-md border border-slate-300 px-4 py-2 text-slate-800" href="/ai-agents">Agents</a>
            <a className="rounded-md bg-slate-950 px-4 py-2 text-white" href="/blogs">Blogs</a>
            <a className="rounded-md bg-orange-500 px-4 py-2 text-white" href="/free-audit">Free audit</a>
          </nav>
        </div>
      </header>

      <section className="bg-mist py-14">
        <div className="section-shell max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">video library</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-slate-950">AI agent videos and workflow demos.</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Watch practical videos on AI SDR workflows, client acquisition automation, and custom AI agent planning before choosing an automation path.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-400" href="https://www.youtube.com/@anutechlabs?sub_confirmation=1" rel="noreferrer" target="_blank">
              Subscribe on YouTube <ArrowRight size={16} />
            </a>
            <a className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800" href="https://www.youtube.com/@anutechlabs" rel="noreferrer" target="_blank">
              Open channel
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell grid gap-6 lg:grid-cols-3">
          {videos.map((video) => (
            <article key={video.slug} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
              <div className="bg-graphite p-4">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full rounded-md border border-orange-500/25"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={video.embedUrl}
                  title={video.title}
                />
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  <PlayCircle size={14} /> {video.tag}
                </span>
                <h2 className="mt-3 text-xl font-black text-slate-950">{video.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{video.description}</p>
                <a className="mt-4 inline-flex items-center gap-2 text-sm font-black text-orange-600" href={video.youtubeUrl} rel="noreferrer" target="_blank">
                  Open on YouTube <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="section-shell">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">related blogs</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Read the strategy behind the videos.</h2>
            </div>
            <a className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white" href="/blogs">
              View all blogs <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {learningBlogs.map((blog) => (
              <a key={blog.slug} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft hover:border-orange-300" href={blog.href}>
                <BookOpen className="text-orange-500" size={22} />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-orange-600">{blog.tag}</p>
                <h3 className="mt-2 text-lg font-black text-slate-950">{blog.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{blog.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
