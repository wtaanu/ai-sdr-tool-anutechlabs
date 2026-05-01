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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '930797199985686');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img
            height="1"
            src="https://www.facebook.com/tr?id=930797199985686&ev=PageView&noscript=1"
            style={{ display: "none" }}
            width="1"
          />
        </noscript>
      </head>
      <body>
        {children}
        <ContactUsFooter />
        <SiteFooter />
      </body>
    </html>
  );
}
