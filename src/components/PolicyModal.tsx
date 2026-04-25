"use client";

import { useState } from "react";
import { X } from "lucide-react";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "AI SDR by AnutechLabs collects profile, contact, consent, enquiry, audit, and booking information only to provide AI agent recommendations, free audit reports, consultation follow-up, and service communication.",
      "Marketing emails include an unsubscribe option. Consent records are maintained for GDPR-style transparency, India DPDP purpose consent, and international data request handling.",
      "Visitors can request access, correction, deletion, export, or consent withdrawal through the data request process."
    ]
  },
  terms: {
    title: "Terms And Conditions",
    body: [
      "AI SDR by AnutechLabs provides information about AI agents, automation workflows, free audits, and consultation services.",
      "Website submissions and free reports do not create a paid client engagement until a separate proposal or agreement is accepted.",
      "Users should provide accurate business information so recommendations and audit reports remain useful."
    ]
  },
  cookies: {
    title: "Cookie Policy",
    body: [
      "The website may use essential browser storage to remember verified access and support form journeys.",
      "Analytics or marketing cookies should be configured with region-aware consent before production tracking is enabled.",
      "Users can clear browser storage or request data support through the privacy process."
    ]
  },
  unsubscribe: {
    title: "Email Unsubscribe",
    body: [
      "Unsubscribe applies to marketing and follow-up emails, not essential OTP, security, audit delivery, or requested consultation messages.",
      "Every marketing email should include an unsubscribe link so users can stop promotional communication."
    ]
  }
};

type PolicyKey = keyof typeof policyContent;

export function PolicyButton({ type, label }: { type: PolicyKey; label?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const policy = policyContent[type];

  return (
    <>
      <button className="font-semibold underline decoration-slate-300 underline-offset-4 hover:text-orange-600" onClick={() => setIsOpen(true)} type="button">
        {label || policy.title}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">{policy.title}</h2>
              <button aria-label="Close policy" className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-700 hover:bg-orange-100" onClick={() => setIsOpen(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              {policy.body.map((item) => <p key={item}>{item}</p>)}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function PolicyLinks({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-4 text-sm ${light ? "text-slate-300" : "text-slate-600"}`}>
      <PolicyButton label="Privacy" type="privacy" />
      <PolicyButton label="Terms" type="terms" />
      <PolicyButton label="Cookies" type="cookies" />
      <a className="font-semibold underline decoration-slate-300 underline-offset-4 hover:text-orange-600" href="/unsubscribe">Email unsubscribe</a>
    </div>
  );
}
