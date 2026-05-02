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
      <script
        dangerouslySetInnerHTML={{
          __html: `
            _linkedin_partner_id = "9235156";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `
        }}
        type="text/javascript"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
          `
        }}
        type="text/javascript"
      />
      <noscript>
        <img
          alt=""
          height="1"
          src="https://px.ads.linkedin.com/collect/?pid=9235156&fmt=gif"
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
      <FreeAuditPanel featuredVideo={featuredVideo} />
    </main>
  );
}
