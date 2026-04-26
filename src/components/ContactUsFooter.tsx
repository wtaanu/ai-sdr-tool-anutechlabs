"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";

export function ContactUsFooter() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  async function submitContact() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          query,
          pageUrl: window.location.href
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your query.");
      }

      setEmail("");
      setQuery("");
      setMessage("Your query has been sent. We will reply on your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send your query.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact-us" className="border-t border-slate-200 bg-white py-14">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
            <Mail size={16} />
            Contact us
          </div>
          <h2 className="mt-4 text-3xl font-black text-slate-950">Send your query</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Share your question, requirement, or issue. Your message will be sent directly to the AnutechLabs owner inbox.
          </p>
        </div>

        <form className="rounded-lg border border-slate-200 bg-mist p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); void submitContact(); }}>
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <input
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-orange-500"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              required
              type="email"
              value={email}
            />
            <textarea
              className="min-h-28 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-orange-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Send your query"
              required
              value={query}
            />
          </div>
          <button className="mt-4 rounded-md bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send query"}
          </button>
          {message && (
            <p className={`mt-4 rounded-md px-4 py-3 text-sm ${message.startsWith("Your query") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
