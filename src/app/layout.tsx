import type { Metadata } from "next";

import "./globals.css";
import { notoSans, pierSans, bricolageGrotesque } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/layout/SiteNav";
import { LenisProvider } from "@/lib/lenis-provider";

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
        className={`${notoSans.className} ${pierSans.variable} ${bricolageGrotesque.variable} antialiased scroll-smooth`}
      >
        <LenisProvider>
          <SiteNav />
          {children}
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
