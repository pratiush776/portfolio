import type { Metadata } from "next";

import "./globals.css";
import { fraunces, hankenGrotesk, leagueSpartan, pierSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
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
        className={`${hankenGrotesk.variable} ${pierSans.variable} ${fraunces.variable} ${leagueSpartan.variable} antialiased`}
      >
        {/* IntroProvider is the single opening-choreography clock — backdrop, hero copy, name
            and scroll cue all read the same two gates instead of each animating independently. */}
        <IntroProvider>
          <SiteNav />
          <SmoothScroll>{children}</SmoothScroll>
        </IntroProvider>
        <Analytics />
      </body>
    </html>
  );
}
