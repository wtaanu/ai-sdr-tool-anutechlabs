"use client";

import { usePathname } from "next/navigation";
import { PolicyLinks } from "@/components/PolicyModal";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="section-shell flex flex-col justify-between gap-4 text-sm text-slate-600 md:flex-row md:items-center">
        <p className="font-semibold text-slate-800">Copyright AnutechLabs 2026</p>
        <PolicyLinks />
      </div>
    </footer>
  );
}
