import type { Metadata } from "next";

import "./globals.css";
import { fraunces, notoSans, pierSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { BrandMark } from "@/components/hero/BrandMark";

export const metadata: Metadata = {
  title: "Pratiush Karki",
  description: "Pratiush Karki | Portfolio | Software Engineer | UI/UX Designer | Business Analyst",
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
        className={`${notoSans.className} ${pierSans.variable} ${fraunces.variable} antialiased`}
      >
        <SiteNav />
        {/* The morphing PRATIUSH wordmark — lives here (not in the page) so it persists as the
            site logo across every surface; on the landing page it animates in from the hero. */}
        <BrandMark />
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
