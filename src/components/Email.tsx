"use client";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface EmailProps {
  className?: string;
}

const Email: React.FC<EmailProps> = ({ className }) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("mailto:pratiush776@gmail.com")}
      className={`button !border-[#00000047] bg-beige text-navy !rounded-[20px] ${className}`}
    >
      <Mail size={18} />
    </button>
  );
};

export default Email;
