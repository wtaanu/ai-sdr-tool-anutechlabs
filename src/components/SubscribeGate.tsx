"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { SignupPanel } from "@/components/SignupPanel";

const STORAGE_KEY = "anutechlabs_verified_user";
const OPEN_GATE_EVENT = "anutechlabs:open-subscribe-gate";

export function isVisitorVerified() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(STORAGE_KEY));
}

export function SubscribeGate() {
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    setIsVerified(isVisitorVerified());
  }, []);

  useEffect(() => {
    function openGate() {
      setIsVerified(false);
    }

    window.addEventListener(OPEN_GATE_EVENT, openGate);
    return () => window.removeEventListener(OPEN_GATE_EVENT, openGate);
  }, []);

  useEffect(() => {
    function guardPublicNavigation(event: MouseEvent) {
      if (isVisitorVerified()) {
        return;
      }

      const target = event.target as HTMLElement;
      const link = target.closest("a");
      const button = target.closest("button");

      if (link) {
        const href = link.getAttribute("href") || "";
        const isAdmin = href.startsWith("/admin");
        const isHash = href.startsWith("#");
        const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

        if (!isAdmin && !isHash && !isExternal) {
          event.preventDefault();
          setIsVerified(false);
        }
      }

      if (button && button.textContent?.toLowerCase().includes("show interest")) {
        event.preventDefault();
        setIsVerified(false);
      }
    }

    document.addEventListener("click", guardPublicNavigation, true);
    return () => document.removeEventListener("click", guardPublicNavigation, true);
  }, []);

  if (isVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-lg border border-orange-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-slate-950 text-orange-400">
            <LockKeyhole size={22} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">required access step</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Subscribe and verify email to continue</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AI SDR by AnutechLabs keeps agent access verified. Complete this once, then the catalogue and enquiry actions unlock.
            </p>
          </div>
        </div>
        <SignupPanel compact onVerified={() => setIsVerified(true)} />
      </section>
    </div>
  );
}

export function openSubscribeGate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_GATE_EVENT));
  }
}
