"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import type { Project } from "../../../data/projects";
import { CaseStudyDeep } from "./CaseStudyDeep";
import { CaseStudySnapshot } from "./CaseStudySnapshot";
import { ModalSiblingNav } from "./ModalSiblingNav";
import type { SiblingLink } from "./SiblingNav";

type ModalSheetProps = {
  project: Project;
  prev: SiblingLink;
  next: SiblingLink;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    setDesktop(mq.matches);
    const listener = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return desktop;
}

const STORAGE_KEY = "works-modal-return-scroll";

export function ModalSheet({ project, prev, next }: ModalSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();

  // Close handler — animates out then routes back.
  const close = () => setOpen(false);

  // After open transitions to false, go back.
  const handleExitComplete = () => {
    if (!open) {
      router.back();
    }
  };

  // Mark the underlying <main> inert while modal is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const mains = document.querySelectorAll("main");
    const touched: HTMLElement[] = [];
    mains.forEach((m) => {
      if (m instanceof HTMLElement) {
        m.setAttribute("inert", "");
        touched.push(m);
      }
    });
    return () => {
      touched.forEach((m) => m.removeAttribute("inert"));
    };
  }, []);

  // Scroll restoration: on unmount, restore saved scrollY for the originating page.
  useLayoutEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw == null) return;
      const y = Number(raw);
      if (Number.isFinite(y)) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
      window.sessionStorage.removeItem(STORAGE_KEY);
    };
  }, []);

  // Drag-to-dismiss on mobile.
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 150 || info.velocity.y > 600) {
      close();
    }
  };

  const layoutId = desktop && !reduced ? `works-card-${project.slug}` : undefined;

  // Content selector — keep CaseStudy dispatcher inline so we can swap SiblingNav for modal nav.
  const inner =
    project.caseStudyType === "deep" ? (
      <CaseStudyDeep project={project} prev={prev} next={next} />
    ) : (
      <CaseStudySnapshot project={project} prev={prev} next={next} />
    );

  const containerClass =
    "relative z-10 w-full max-w-6xl bg-beige text-navy rounded-t-2xl md:rounded-2xl border border-navy border-r-[4px] border-b-[4px] max-h-[92vh] overflow-y-auto";

  let contentMotion: React.ReactNode;
  if (reduced) {
    contentMotion = (
      <motion.div
        key="modal-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className={containerClass}
      >
        {inner}
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="fixed right-4 top-4 z-20 rounded-full bg-beige p-2 text-navy border border-navy shadow hover:bg-navy hover:text-beige transition-colors md:absolute"
        >
          <X size={20} />
        </button>
      </motion.div>
    );
  } else if (desktop) {
    contentMotion = (
      <motion.div
        key="modal-content"
        layoutId={layoutId}
        className={containerClass}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        {inner}
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-20 rounded-full bg-beige p-2 text-navy border border-navy shadow hover:bg-navy hover:text-beige transition-colors"
        >
          <X size={20} />
        </button>
      </motion.div>
    );
  } else {
    contentMotion = (
      <motion.div
        key="modal-content"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={containerClass}
      >
        {/* drag handle affordance */}
        <div className="sticky top-0 z-20 flex justify-center bg-beige/95 pt-2 backdrop-blur">
          <span aria-hidden className="block h-1.5 w-12 rounded-full bg-navy/30" />
        </div>
        {inner}
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="fixed right-4 top-4 z-20 rounded-full bg-beige p-2 text-navy border border-navy shadow hover:bg-navy hover:text-beige transition-colors"
        >
          <X size={20} />
        </button>
      </motion.div>
    );
  }

  // Render the in-modal sibling nav as a portal-style sticky element by injecting into CaseStudy?
  // The existing CaseStudy variants render their own SiblingNav (Link-based). For modal nav we want
  // router.replace. Use a CSS hide trick on the embedded SiblingNav, and overlay ModalSiblingNav.
  // Implemented by class targeting: SiblingNav uses nav[aria-label="Project navigation"]. We'll
  // hide it via a style block scoped to this modal and append ModalSiblingNav at the end.
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                key="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="fixed inset-0 z-[95] flex items-end justify-center md:items-center md:p-4">
                <Dialog.Title className="sr-only">{project.title}</Dialog.Title>
                <style>{`
                  .modal-sheet-scope nav[aria-label="Project navigation"] { display: none !important; }
                `}</style>
                <div className="modal-sheet-scope contents">
                  {contentMotion}
                </div>
                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex justify-center px-3 pb-4 sm:px-4">
                  <div className="pointer-events-auto w-full max-w-5xl">
                    <ModalSiblingNav prev={prev} next={next} />
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
