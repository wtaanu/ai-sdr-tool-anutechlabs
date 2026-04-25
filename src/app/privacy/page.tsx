import { DataRequestForm } from "@/components/DataRequestForm";

export const metadata = {
  title: "Privacy Policy | AI SDR by AnutechLabs"
};

export default function PrivacyPage() {
  return (
    <main className="bg-mist py-16">
      <section className="section-shell max-w-4xl rounded-lg bg-white p-8 shadow-soft">
        <a className="text-sm font-bold text-orange-600" href="/">Back to website</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Privacy Policy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
          <p>AI SDR by AnutechLabs collects profile, enquiry, consent, and booking information to understand business requirements, recommend AI agents, and manage consultation follow-up.</p>
          <p>Data may include name, email, mobile number, country, company, selected agents, custom requirements, consent records, and booking preferences.</p>
          <p>Visitors may request access, correction, deletion, export, or consent withdrawal. Marketing emails include an unsubscribe option.</p>
          <p>This page is a product-ready draft and should be reviewed with legal guidance before production launch.</p>
        </div>
        <DataRequestForm />
      </section>
    </main>
  );
}
