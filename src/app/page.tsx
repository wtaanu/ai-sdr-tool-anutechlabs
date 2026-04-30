import { ArrowRight, Bot, CalendarCheck, CheckCircle2, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { SubscribeGate } from "@/components/SubscribeGate";
import { ChatAssistant } from "@/components/ChatAssistant";
import { agents, categories } from "@/data/agents";

const featuredAgents = agents.slice(0, 12);
const customAgent = agents.find((agent) => agent.id === 50);

export default function Home() {
  return (
    <main className="bg-white">
      <SubscribeGate />
      <ChatAssistant />
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="section-shell flex min-h-20 items-center justify-between gap-4">
          <a className="flex items-center gap-3" href="#">
            <span>
              <span className="block text-sm font-bold text-slate-950">AI SDR by AnutechLabs</span>
              <span className="block text-xs text-slate-500">Business automation agents</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#agents">Agents</a>
            <a href="/free-audit">Free Audit</a>
            <a href="#workflow">Workflow</a>
            <a href="#about">About</a>
            <a href="#privacy">Privacy</a>
          </nav>
          <a className="rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white" href="#start">
            Start
          </a>
        </div>
      </header>

      <section className="bg-mist py-10 lg:py-14">
        <div className="section-shell grid items-center gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              AI SDR agents that capture, qualify, follow up, and book client calls.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-650">
              A verified lead portal for businesses searching for AI agents across sales, LinkedIn, Meta,
              social automation, email, finance, compliance, operations, and custom workflows.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white" href="/free-audit">
                Get free audit <ArrowRight size={16} />
              </a>
              <a className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800" href="#agents">
                View agent categories
              </a>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Email-first tracking", "AI lead scoring", "CRM-ready pipeline"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="text-orange-500" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div id="start" className="rounded-lg border border-orange-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">start here</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Get your free audit first.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              No signup gate. Share your email inside the free audit or show-interest form, and AI SDR will create your profile from that action.
            </p>
            <a className="mt-5 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white" href="#agents">
              Explore agents
            </a>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="section-shell grid gap-4 md:grid-cols-4">
          {[
            { icon: Sparkles, label: "Custom AI roadmap", text: "Understand which automation can improve your sales and operations first." },
            { icon: Bot, label: "Find your best-fit agent", text: "Answer a few questions and get practical AI recommendations." },
            { icon: MailCheck, label: "Free audit report", text: "Receive a clear automation report with roadmap and ROI direction." },
            { icon: CalendarCheck, label: "Book a strategy call", text: "Discuss your workflow and get a realistic build plan." }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <item.icon className="text-orange-500" size={24} />
              <h3 className="mt-4 font-bold text-slate-950">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="agents" className="code-grid bg-graphite py-20 text-white">
        <div className="section-shell">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-orange-400">agent catalogue</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black">50 business AI agents, shown in a premium coding-theme marketplace.</h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Search traffic can land on any agent, industry, or use case. Verified users can select an agent or describe a custom one.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((category) => (
                <span key={category} className="rounded-full border border-orange-500/30 bg-black/30 px-3 py-2 text-xs font-bold text-orange-200">
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <a className="inline-flex items-center gap-2 rounded-md border border-orange-500/40 bg-black/40 px-5 py-3 text-sm font-bold text-orange-200" href="/ai-agents">
              Open all 50 agents <ArrowRight size={16} />
            </a>
          </div>
          {customAgent && (
            <div className="mt-8 rounded-lg border border-orange-500/25 bg-black/35 p-5">
              <div className="grid items-center gap-5 lg:grid-cols-[1fr_420px]">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-400">custom workflow</p>
                  <h3 className="mt-3 text-2xl font-black text-white">Do not see your exact agent? Describe it and enter the same AI SDR journey.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Agent selection is optional. A verified visitor can explain their industry, problem, workflow, and expected outcome.
                    The enquiry is stored as a custom agent request in your admin dashboard.
                  </p>
                </div>
                <AgentCard agent={customAgent} />
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="workflow" className="py-20">
        <div className="section-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">AI SDR workflow</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">From idea to your own revenue-focused AI agent.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              "Explore agents or get a free audit",
              "Tell us your industry, niche, and business goal",
              "Book a call and finalize your custom workflow",
              "Get your AI agent created and aim for 70% more revenue from better follow-up"
            ].map((step, index) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <span className="font-mono text-sm font-bold text-orange-500">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-mist py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">About the builder</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">Built by Anuragini Pathak, focused on practical AI automation.</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" href="https://www.instagram.com/anutechaitools/" target="_blank" rel="noreferrer">Instagram</a>
              <a className="rounded-md bg-orange-500 px-4 py-3 text-sm font-bold text-white" href="https://www.linkedin.com/in/anuragini-pathak-49a03564/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-700">
            <p>
              This platform is being built around practical business workflows: sales follow-up, email systems,
              lead qualification, dashboards, AI analysis, CRM records, and custom automation. The goal is not to
              add AI because it sounds impressive. The goal is to reduce missed leads, slow replies, manual tracking,
              and scattered tools.
            </p>
            <p>
              The work combines hands-on technical building with a clear understanding of how businesses actually
              lose opportunities. Every agent should either save time, improve visibility, increase follow-up quality,
              or help a team convert more enquiries into real conversations.
            </p>
          </div>
        </div>
      </section>

      <section id="privacy" className="py-20">
        <div className="section-shell grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ShieldCheck className="text-orange-500" size={34} />
            <h2 className="mt-4 text-3xl font-black text-slate-950">Privacy-first by design.</h2>
          </div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
            {["GDPR-style consent records", "Email unsubscribe for marketing", "India DPDP consent purpose", "Data access and deletion requests"].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Prepared for region-aware handling of profiles, audits, enquiries, and marketing email preferences.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
