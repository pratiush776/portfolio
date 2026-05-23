import { Mail } from "lucide-react";

interface EmailProps {
  className?: string;
}

export default function Email({ className }: EmailProps) {
  return (
    <a
      href="mailto:pratiush776@gmail.com"
      aria-label="Send email to Pratiush Karki"
      className={`button !border-[#00000047] bg-beige text-navy !rounded-[20px] ${className}`}
    >
      <Mail size={18} />
    </a>
  );
}
