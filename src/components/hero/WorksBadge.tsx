import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";

export function WorksBadge() {
  return (
    <Link href="#" className="works-cta-v3" aria-label="See my works">
      <span className="works-cta-v3__label">See my works</span>
      <span className="works-cta-v3__icon" aria-hidden>
        <ArrowUpRight />
      </span>
    </Link>
  );
}
