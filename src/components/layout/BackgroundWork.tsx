"use client";

import { usePathname } from "next/navigation";

import { usePortfolioView } from "@/lib/usePortfolioView";
import { usePrewarm } from "@/lib/usePrewarm";

/**
 * Renders nothing. It exists so the root layout — a Server Component — can run the two effects
 * that belong to a page load rather than to anything on screen: the visit report, and the ping
 * that starts the sleeping project demos booting.
 *
 * They share a component because they share a shape — once per load, off the critical path,
 * nothing shown to the visitor — and keeping them together is what stops a third one being mounted
 * somewhere else later. The reasoning for each lives with its own hook.
 *
 * The layout does not remount on client-side navigation, so `usePathname` here is what lets the
 * visit report follow a reader from the landing page through the case pages as ONE visit.
 */
export function BackgroundWork() {
  usePortfolioView(usePathname());
  usePrewarm();
  return null;
}
