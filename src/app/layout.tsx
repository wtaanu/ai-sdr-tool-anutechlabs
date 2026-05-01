import type { Metadata } from "next";
import Script from "next/script";
import { ContactUsFooter } from "@/components/ContactUsFooter";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI SDR by AnutechLabs",
  description:
    "AI SDR by AnutechLabs is a verified AI agent portal for lead generation, client acquisition, LinkedIn, Meta, social automation, compliance, and custom business workflows.",
  keywords: [
    "AI SDR",
    "AI agents for business",
    "client acquisition agent",
    "LinkedIn AI agent",
    "Meta automation agent",
    "AI lead generation"
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18131528034" strategy="afterInteractive" />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18131528034');
          `}
        </Script>
      </head>
      <body>
        {children}
        <ContactUsFooter />
        <SiteFooter />
      </body>
    </html>
  );
}
