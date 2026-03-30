"use client";

import { usePortfolioView } from "@/hooks/usePortfolioView";

export function PortfolioViewNotifier() {
  usePortfolioView();
  return null;
}
