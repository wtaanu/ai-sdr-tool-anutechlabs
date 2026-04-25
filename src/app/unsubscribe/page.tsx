import { UnsubscribeForm } from "@/components/UnsubscribeForm";

export const metadata = {
  title: "Unsubscribe | AI SDR by AnutechLabs"
};

export default function UnsubscribePage() {
  return (
    <main className="bg-mist py-16">
      <section className="section-shell max-w-3xl rounded-lg bg-white p-8 shadow-soft">
        <a className="text-sm font-bold text-orange-600" href="/">Back to website</a>
        <h1 className="mt-6 text-4xl font-black text-slate-950">Unsubscribe</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          Enter your email to stop receiving marketing communication from AI SDR by AnutechLabs.
        </p>
        <UnsubscribeForm />
      </section>
    </main>
  );
}
