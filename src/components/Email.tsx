import { Mail } from "lucide-react";
import React from "react";

interface EmailProps {
  className?: string;
}

const Email: React.FC<EmailProps> = ({ className }) => {
  return (
    <a
      href="mailto:pratiush776@gmail.com"
      aria-label="Send email to Pratiush Karki"
      className={`button !border-[#00000047] bg-beige text-navy !rounded-[20px] ${className}`}
    >
      <Mail size={18} />
    </a>
  );
};

export default Email;
