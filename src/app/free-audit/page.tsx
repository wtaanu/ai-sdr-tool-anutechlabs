import { FreeAuditPanel } from "@/components/FreeAuditPanel";

export const metadata = {
  title: "Free Sales Automation Audit | AI SDR by AnutechLabs",
  description: "See where your sales team wastes time and get a personalized sales automation audit with annual savings, roadmap, and next steps."
};

export default function FreeAuditLandingPage() {
  return (
    <main className="bg-white">
      <FreeAuditPanel />
    </main>
  );
}
