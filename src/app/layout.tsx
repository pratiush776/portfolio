import type { Metadata } from "next";

import "./globals.css";
import {
  styleScript,
  anton,
  bricolageGrotesque,
  fraunces,
  sentient,
  hankenGrotesk,
} from "@/lib/fonts";
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
        className={`${hankenGrotesk.variable} ${bricolageGrotesque.variable} ${sentient.variable} ${fraunces.variable} ${anton.variable} ${styleScript.variable} antialiased`}
      >
        {/* Keyboard skip link — hidden until focused, so the visual default is unchanged. Lets AT /
            keyboard users jump past the long pinned hero straight to the work. */}
        <a href="#works" className="skip-link">
          Skip to projects
        </a>
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
