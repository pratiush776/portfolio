import type { Metadata } from "next";

import "./globals.css";
import { instrumentSans, kumbhSans, styleScript } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export const metadata: Metadata = {
  title: "Pratiush Karki",
  description: "Pratiush Karki — Product-focused full-stack developer.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${kumbhSans.variable} ${styleScript.variable} antialiased`}
      >
        <a href="#work" className="skip-link">
          Skip to work
        </a>
        <SiteNav />
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
