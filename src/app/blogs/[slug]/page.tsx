import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import { ChatAssistant } from "@/components/ChatAssistant";
import { learningBlogs, learningVideos } from "@/data/learning";

export function generateStaticParams() {
  return learningBlogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = learningBlogs.find((item) => item.slug === resolvedParams.slug);
  if (!blog) return {};

  return {
    title: `${blog.title} | AI SDR by AnutechLabs`,
    description: blog.description,
    alternates: {
      canonical: `/blogs/${blog.slug}`
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = learningBlogs.find((item) => item.slug === resolvedParams.slug);
  if (!blog) notFound();

  return (
    <main className="bg-white">
      <ChatAssistant />
      <header className="border-b border-slate-200 bg-white">
        <div className="section-shell flex min-h-20 flex-col justify-center gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-black text-slate-950" href="/">AI SDR by AnutechLabs</a>
          <nav className="flex flex-wrap gap-3 text-sm font-bold">
            <a className="rounded-md border border-slate-300 px-4 py-2 text-slate-800" href="/blogs">Blogs</a>
            <a className="rounded-md bg-slate-950 px-4 py-2 text-white" href="/videos">Videos</a>
            <a className="rounded-md bg-orange-500 px-4 py-2 text-white" href="/free-audit">Free audit</a>
          </nav>
        </div>
      </header>

      <article>
        <section className="bg-mist py-14">
          <div className="section-shell max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700">
              <BookOpen size={14} /> {blog.tag} · {blog.readTime}
            </span>
            <h1 className="mt-5 text-5xl font-black leading-tight text-slate-950">{blog.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{blog.description}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="section-shell grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">agent focus</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{blog.agentName}</h2>
                <p className="mt-3 text-sm leading-7 text-orange-950"><strong>Issue:</strong> {blog.pain}</p>
                <p className="mt-2 text-sm leading-7 text-orange-950"><strong>Resolution:</strong> {blog.resolution}</p>
              </div>

              {blog.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-3xl font-black text-slate-950">{section.heading}</h2>
                  <p className="mt-4 text-base leading-8 text-slate-700">{section.body}</p>
                </section>
              ))}

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-2xl font-black text-slate-950">What to do next</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  If this problem exists in your business, start with a free automation audit. It will show the best-fit agent, expected benefit, and a realistic build path.
                </p>
                <a className="mt-5 inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white" href="/free-audit">
                  Get free audit <ArrowRight size={16} />
                </a>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-black text-slate-950">Watch related video</h2>
                {learningVideos.map((video) => (
                  <a key={video.slug} className="mt-4 block rounded-md bg-graphite p-4 text-white" href="/videos">
                    <PlayCircle className="text-orange-400" size={24} />
                    <p className="mt-3 font-bold">{video.title}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{video.description}</p>
                  </a>
                ))}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-black text-slate-950">More blogs</h2>
                <div className="mt-4 space-y-3">
                  {learningBlogs.filter((item) => item.slug !== blog.slug).map((item) => (
                    <a key={item.slug} className="block rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-800 hover:bg-orange-50" href={item.href}>
                      {item.title}
                    </a>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </article>
    </main>
  );
}
