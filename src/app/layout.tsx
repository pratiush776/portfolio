import type { Metadata } from "next";

import "./globals.css";
import { fraunces, notoSans, pierSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { BrandMark } from "@/components/hero/BrandMark";
import { IntroProvider } from "@/components/intro/IntroProvider";

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
        {/* IntroProvider is the single opening-choreography clock. It must sit above <BrandMark/>
            (which is layout-scoped) so the wordmark, backdrop, hero copy and scroll cue all read
            the same two gates instead of each animating independently. */}
        <IntroProvider>
          <SiteNav />
          {/* The morphing PRATIUSH wordmark — lives here (not in the page) so it persists as the
              site logo across every surface; on the landing page it animates in from the hero. */}
          <BrandMark />
          <SmoothScroll>{children}</SmoothScroll>
        </IntroProvider>
        <Analytics />
      </body>
    </html>
  );
}
