import type { Metadata } from "next";

import "./globals.css";
import Nav from "@/components/Nav";
import { notoSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { PortfolioViewNotifier } from "@/components/PortfolioViewNotifier";

export const metadata: Metadata = {
  title: "Pratiush Karki | Software Developer & Portfolio",
  description: "Pratiush Karki | Software Developer & Portfolio",
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
        className={` ${notoSans.className} antialiased bg-navy scroll-smooth `}
      >
        <PortfolioViewNotifier />
        <Nav className="z-2" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
