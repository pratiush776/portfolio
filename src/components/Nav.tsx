"use client";
import React from "react";
import MiniNav from "./MiniNav";
import FullNav from "./FullNav";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Plus } from "lucide-react";

interface NavToggleProps {
  className?: string;
}
const NavToggle: React.FC<NavToggleProps> = ({ className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const menuId = React.useId();
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = React.useRef(false);
  const menuIsVisible = isOpen || isClosing;

  const closeMenu = React.useCallback((restoreFocus = false) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setIsClosing(true);
    setIsOpen(false);
  }, []);

  const toggleMenu = React.useCallback(() => {
    if (isOpen) {
      closeMenu(true);
      return;
    }

    shouldRestoreFocusRef.current = false;
    setIsOpen(true);
  }, [closeMenu, isOpen]);

  React.useEffect(() => {
    const menuIsActive = isOpen || isClosing;

    if (!menuIsActive) {
      if (shouldRestoreFocusRef.current) {
        toggleButtonRef.current?.focus();
        shouldRestoreFocusRef.current = false;
      }
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    };

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isClosing, isOpen]);

  return (
    <motion.nav
      initial={{
        height: "10vh",
        backgroundColor: "#2f4156",
        borderRadius: "0px 0px 20px 20px",
      }}
      animate={{
        height: isOpen ? "100vh" : "10vh",
        backgroundColor: isOpen ? "#1d242d" : "#2f4156",
        borderRadius: isOpen ? "0" : "0px 0px 20px 20px",
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => setIsClosing(false)}
      className={`fixed inset-x-0 top-0 z-50 flex flex-col rounded-b-[20px] overflow-hidden ${className}`}
    >
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={toggleMenu}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="absolute top-[2.9vh] left-6 md:left-8 z-20 bg-beige h-10 w-10 shrink-0 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="plus"
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.8 }}
              transition={{ duration: 0.4 }}
            >
              <Plus className="rotate-45 text-navy" size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="text-navy" size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <div className="h-[10vh] w-full">
        {!menuIsVisible && (
          <div className="h-full min-w-0 pl-[4.75rem] md:pl-[5.5rem] pr-6 md:pr-8 flex items-center">
            <MiniNav />
          </div>
        )}
      </div>
      {menuIsVisible && (
        <motion.div
          id={menuId}
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-hidden={!isOpen}
          className="absolute inset-x-0 top-[10vh] bottom-0 px-6 md:px-8"
        >
          <FullNav closeMenu={closeMenu} />
        </motion.div>
      )}
    </motion.nav>
  );
};

export default NavToggle;
