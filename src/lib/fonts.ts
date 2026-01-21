import { Noto_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const pierSans = localFont({
  variable: "--font-pier-sans",
  src: [
    {
      path: "../fonts/Pier-Sans/PPPierSans-Bold.otf",
      style: "normal",
    },
  ],
});
