import type { Metadata } from "next";

import "lenis/dist/lenis.css";
import "./globals.css";
import {
  instrumentSans,
  instrumentSerif,
  kumbhSans,
  styleScript,
} from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { IntroProvider } from "@/components/intro/IntroContext";
import { GATE_SCRIPT } from "@/lib/intro";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { BackgroundWork } from "@/components/layout/BackgroundWork";

export const metadata: Metadata = {
  title: "PRATIUSH",
  description:
    "PRATIUSH — I build and ship products across the full stack, AI, and design.",
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
    // The gate script writes a class onto this element before React hydrates, so the server's
    // markup and the live DOM genuinely differ here — by design, and unpatchable, since the whole
    // point is to decide before the first paint. `suppressHydrationWarning` is the sanctioned way
    // to say so; it covers this element's own attributes only, not anything nested inside it, so
    // real mismatches further down still surface.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${instrumentSerif.variable} ${kumbhSans.variable} ${styleScript.variable} antialiased`}
      >
        {/* Decides whether this load gets the intro, before anything paints. See lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />

        <IntroProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <SiteNav />
          <SmoothScroll>{children}</SmoothScroll>
        </IntroProvider>

        <Analytics />
        {/* Renders nothing. Mounted last because it is the lowest-priority thing on the page —
            it works around the load rather than taking part in it. */}
        <BackgroundWork />
      </body>
    </html>
  );
}
