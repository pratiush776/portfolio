"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import { useContactModal } from "@/components/contact/ContactModalProvider";

export function WorksFooter() {
  const { open } = useContactModal();

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16 text-center sm:px-6">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
      <h2
        className={`${pierSans.className} text-3xl text-navy sm:text-4xl md:text-5xl`}
      >
        Like what you see?
      </h2>
      <p className="mt-3 text-lg text-navy/70 sm:text-xl">
        Let&apos;s connect.
      </p>
      <button
        type="button"
        onClick={open}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-navy bg-navy px-6 py-3 text-sm font-medium text-beige transition hover:bg-navy/90"
      >
        Get in touch
      </button>
    </footer>
  );
}
