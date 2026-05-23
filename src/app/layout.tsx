import type { Metadata } from "next";

import "./globals.css";
import { notoSans, pierSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import { PortfolioViewNotifier } from "@/components/PortfolioViewNotifier";
import { SiteNav } from "@/components/layout/SiteNav";
import { ContactModalProvider } from "@/components/contact/ContactModalProvider";

export const metadata: Metadata = {
  title: "Pratiush Karki",
  description: "Pratiush Karki | Portfolio | Software Engineer | UI/UX Designer | Business Analyst",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.className} ${pierSans.variable} antialiased scroll-smooth`}
      >
        <PortfolioViewNotifier />
        <ContactModalProvider>
          <SiteNav />
          {children}
          {modal}
        </ContactModalProvider>
        <Analytics />
      </body>
    </html>
  );
}
