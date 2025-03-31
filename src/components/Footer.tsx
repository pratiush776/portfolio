import React from "react";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <div
      id="footer"
      className={` h-[5vh] z-4 flex justify-center items-center  ${className}`}
    >
      <p className="text-[12px] text-navy">Copyright © 2025 Pratiush Karki</p>
    </div>
  );
};

export default Footer;
