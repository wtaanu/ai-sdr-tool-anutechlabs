import type { Metadata } from "next";
import { ContactUsFooter } from "@/components/ContactUsFooter";
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
      <body>
        {children}
        <ContactUsFooter />
      </body>
    </html>
  );
}
