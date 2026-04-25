"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PolicyButton } from "@/components/PolicyModal";

type SignupPanelProps = {
  compact?: boolean;
  onVerified?: () => void;
};

export function SignupPanel({ compact = false, onVerified }: SignupPanelProps) {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    country: "",
    company: "",
    website: "",
    otp: ""
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function requestOtp() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "website" })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send OTP.");
      }

      setMessage(result.message || "OTP sent to your email.");
      setStep("otp");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOtp() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "website" })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to verify OTP.");
      }

      setMessage("Verified. Your profile is created and the agent catalogue is unlocked.");
      window.localStorage.setItem("anutechlabs_verified_user", JSON.stringify(result.user));
      setIsVerified(true);
      onVerified?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`${compact ? "" : "rounded-lg border border-slate-200 bg-white p-6 shadow-soft"}`}>
      {isVerified ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
          <CheckCircle2 className="text-orange-600" size={28} />
          <h2 className="mt-3 text-2xl font-black text-slate-950">You are verified.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Explore agents, get your free audit, or describe a custom AI workflow.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="rounded-md bg-orange-500 px-4 py-3 text-sm font-bold text-white" href="#free-audit">Get free audit</a>
            <a className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" href="/ai-agents">Explore agents</a>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Verified access</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Create your business profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Verify once, then explore AI agents, request a free audit, and book a consultation.
            </p>
          </div>

      {step === "details" ? (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void requestOtp(); }}>
          <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("fullName", event.target.value)} placeholder="Full name" required value={form.fullName} />
          <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("email", event.target.value)} placeholder="Business email" required type="email" value={form.email} />
          <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("mobile", event.target.value)} placeholder="Mobile number with country code" required value={form.mobile} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("country", event.target.value)} placeholder="Country" required value={form.country} />
            <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" onChange={(event) => updateField("company", event.target.value)} placeholder="Company" value={form.company} />
          </div>
          <label className="flex gap-3 text-xs leading-5 text-slate-600">
            <input className="mt-1" type="checkbox" required />
            <span>
              I agree to be contacted about AI agents and accept the <PolicyButton label="privacy policy" type="privacy" />, <PolicyButton label="terms" type="terms" />, and email unsubscribe option.
            </span>
          </label>
          <button className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send 6-digit OTP"}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void verifyOtp(); }}>
          <input className="w-full rounded-md border border-slate-300 px-4 py-3 text-center font-mono text-xl tracking-[0.45em] outline-none focus:border-orange-500" maxLength={6} onChange={(event) => updateField("otp", event.target.value)} placeholder="000000" required value={form.otp} />
          <button className="w-full rounded-md bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify and continue"}
          </button>
          <button className="w-full text-sm font-semibold text-slate-600" type="button" onClick={() => setStep("details")}>
            Edit details
          </button>
        </form>
      )}
      {message && (
        <p className={`mt-4 rounded-md px-4 py-3 text-sm ${message.startsWith("OTP") || message.startsWith("Verified") ? "bg-orange-50 text-orange-800" : "bg-red-50 text-red-700"}`}>
          {message}
        </p>
      )}
        </>
      )}
    </div>
  );
}
