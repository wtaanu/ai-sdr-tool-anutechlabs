import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import { ChatAssistant } from "@/components/ChatAssistant";
import { learningBlogs, learningVideos } from "@/data/learning";

export const metadata = {
  title: "AI Automation Blogs | AI SDR by AnutechLabs",
  description:
    "Read AI SDR by AnutechLabs blogs on AI agents, lead response speed, client acquisition automation, follow-up systems, and custom AI workflows.",
  keywords: [
    "AI automation blogs",
    "AI SDR blog",
    "AI agents for business blog",
    "lead generation automation blog",
    "client acquisition AI"
  ],
  alternates: {
    canonical: "/blogs"
  }
};

export default function BlogsPage() {
  return (
    <main className="bg-white">
      <ChatAssistant />
      <header className="border-b border-slate-200 bg-white">
        <div className="section-shell flex min-h-20 flex-col justify-center gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-black text-slate-950" href="/">AI SDR by AnutechLabs</a>
          <nav className="flex flex-wrap gap-3 text-sm font-bold">
            <a className="rounded-md border border-slate-300 px-4 py-2 text-slate-800" href="/ai-agents">Agents</a>
            <a className="rounded-md bg-slate-950 px-4 py-2 text-white" href="/videos">Videos</a>
            <a className="rounded-md bg-orange-500 px-4 py-2 text-white" href="/free-audit">Free audit</a>
          </nav>
        </div>
      </header>

      <section className="bg-mist py-14">
        <div className="section-shell max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">blog library</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-slate-950">AI automation blogs for business owners.</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Read practical articles about AI agents, follow-up automation, client acquisition, sales workflows, and how to choose the right first automation.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell grid gap-6 lg:grid-cols-3">
          {learningBlogs.map((blog) => (
            <article key={blog.slug} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                <BookOpen size={14} /> {blog.tag}
              </span>
              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">{blog.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{blog.description}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{blog.readTime}</p>
              <a className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" href={blog.href}>
                Read blog <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-graphite py-16 text-white">
        <div className="section-shell">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-orange-400">related videos</p>
              <h2 className="mt-3 text-3xl font-black">Watch the demos behind these ideas.</h2>
            </div>
            <a className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white" href="/videos">
              View all videos <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {learningVideos.map((video) => (
              <a key={video.slug} className="rounded-lg border border-orange-500/25 bg-black/35 p-5 hover:border-orange-400" href="/videos">
                <PlayCircle className="text-orange-400" size={24} />
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-orange-300">{video.tag}</p>
                <h3 className="mt-2 text-lg font-black text-white">{video.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{video.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
