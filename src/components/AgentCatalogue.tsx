"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import type { Agent } from "@/data/agents";
import { getAgentIndustries, getAgentProblems } from "@/lib/agentDetails";

export function AgentCatalogue({ agents, categories }: { agents: Agent[]; categories: string[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [need, setNeed] = useState("All");

  const industries = useMemo(() => Array.from(new Set(agents.flatMap(getAgentIndustries))).sort(), [agents]);
  const needs = ["Lead generation", "Follow-up", "Call booking", "Email", "LinkedIn", "Instagram", "Meta ads", "SEO", "Invoice", "Compliance", "Operations", "Custom"];

  const filteredAgents = agents.filter((agent) => {
    const haystack = `${agent.name} ${agent.category} ${agent.outcome} ${agent.workflow.join(" ")} ${getAgentProblems(agent).join(" ")} ${getAgentIndustries(agent).join(" ")}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesCategory = category === "All" || agent.category === category;
    const matchesIndustry = industry === "All" || getAgentIndustries(agent).includes(industry);
    const matchesNeed = need === "All" || haystack.includes(need.toLowerCase());
    return matchesSearch && matchesCategory && matchesIndustry && matchesNeed;
  });

  return (
    <>
      <section className="border-y border-orange-500/20 bg-black/35 py-5">
        <div className="section-shell grid gap-4 lg:grid-cols-[1fr_180px_220px_180px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" size={18} />
            <input className="w-full rounded-md border border-orange-500/30 bg-black/55 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400" onChange={(event) => setSearch(event.target.value)} placeholder="Search by industry, niche, problem, tool, or goal" value={search} />
          </label>
          <select className="rounded-md border border-orange-500/30 bg-black/55 px-3 py-3 text-sm text-white outline-none focus:border-orange-400" onChange={(event) => setCategory(event.target.value)} value={category}>
            <option>All</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-md border border-orange-500/30 bg-black/55 px-3 py-3 text-sm text-white outline-none focus:border-orange-400" onChange={(event) => setIndustry(event.target.value)} value={industry}>
            <option>All</option>
            {industries.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-md border border-orange-500/30 bg-black/55 px-3 py-3 text-sm text-white outline-none focus:border-orange-400" onChange={(event) => setNeed(event.target.value)} value={need}>
            <option>All</option>
            {needs.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>
      <section className="pb-20 pt-8">
        <div className="section-shell">
          <p className="mb-5 text-sm font-bold text-orange-300">{filteredAgents.length} suitable agents found</p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </section>
    </>
  );
}
