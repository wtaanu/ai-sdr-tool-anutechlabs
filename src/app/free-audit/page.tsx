import { FreeAuditPanel } from "@/components/FreeAuditPanel";
import { getPublishedLearningVideos } from "@/lib/learningVideos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Free Sales Automation Audit | AI SDR by AnutechLabs",
  description: "See where your sales team wastes time and get a personalized sales automation audit with annual savings, roadmap, and next steps."
};

export default async function FreeAuditLandingPage() {
  const [featuredVideo] = await getPublishedLearningVideos();

  return (
    <main className="bg-white">
      <FreeAuditPanel featuredVideo={featuredVideo} />
    </main>
  );
}
