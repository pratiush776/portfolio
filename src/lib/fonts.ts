import { Noto_Sans, Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";

export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
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
