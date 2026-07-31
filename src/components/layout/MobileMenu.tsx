"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { GitHub, LinkedIn, Mail } from "@/components/icons";
import { DUR, EASE } from "@/lib/motion";

/**
 * The phone's navigation, and the only thing on the site that exists below 768px and not above it.
 *
 * The bar itself has never had a single `@media` rule — three text links render at 390px exactly
 * as they do at 1440px, which is legible but spends the whole right half of a phone's header on
 * them. This replaces them with one control and gives the destinations a screen of their own.
 *
 * THREE PARTS, AND THE SPLIT IS FORCED BY THE BAR'S BLEND MODE. `.site-nav` carries
 * `mix-blend-mode: difference`, which creates a stacking context — a panel rendered inside it
 * would be inverted along with everything else in there. So the panel is a SIBLING of the nav,
 * painted underneath it, and that turns out to be the arrangement we wanted anyway: the brand and
 * the toggle sit above the ink field and invert themselves to bone against it, exactly the way
 * they already do when the footer scrolls under them. Nothing has to know the menu is open.
 *
 * The motion is the preloader's curtain run the other way. The intro lifts by growing the BOTTOM
 * inset of an `inset()` clip until the field has left through the top of the screen; this grows
 * the same inset in reverse, so the panel arrives downward out of the bar. Same `EASE`, which is
 * the site's one curve and the part that reads as "the same movement".
 */

/* --------------------------------------------------------------------------------------------
   The state
   -------------------------------------------------------------------------------------------- */

type Menu = { open: boolean; toggle: () => void; close: () => void };

/** Closed, and inert. Anything reading this outside the provider behaves as if there is no menu. */
const MenuContext = createContext<Menu>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export const useMenu = () => useContext(MenuContext);

/** The one breakpoint the site has. Matching it here keeps the JS and the CSS on one number. */
const PHONE = "(max-width: 767px)";

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  // Crossing up to the desktop layout takes the toggle away with it. Without this the menu would
  // stay open behind a `display: none`, holding the scroll lock with no control left to release
  // it — the one state this component can get into that a visitor cannot get out of.
  //
  // Subscribed rather than derived from a `useMediaQuery` boolean, for two reasons. Deriving
  // (`open && phone`) leaves the intent set, so resizing back down would spring the panel open
  // again on its own. And closing it from an effect BODY on that boolean is a cascading render —
  // the state React already knows about, re-set a frame later. A listener is neither: it is the
  // external system telling us it changed, which is the one shape an effect is actually for.
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => {
      if (!mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // The document half of the hold — see `html.is-menu-open`, which locks touch WITHOUT clipping
  // the document. Clipping removes the scrollbar, which moves the width media queries read, which
  // makes the listener above fire on a menu that just opened and close it again. The class has to
  // stay layout-neutral or these two effects fight each other.
  useEffect(() => {
    document.documentElement.classList.toggle("is-menu-open", open);
    return () => document.documentElement.classList.remove("is-menu-open");
  }, [open]);

  // Escape closes it, which is the one keyboard affordance a panel like this owes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/* --------------------------------------------------------------------------------------------
   The control
   -------------------------------------------------------------------------------------------- */

const PANEL_ID = "site-menu";

/**
 * Three 1px rules that become two. Built the way `.past__sign` builds its + → ×: from the line
 * weight the site already draws with, rather than from two icons swapped at the crossover, so the
 * shape is genuinely in motion instead of being replaced mid-gesture.
 *
 * The bars carry their rest offsets as TRANSFORMS rather than as `top` values, so open and closed
 * are one property animating between two values and the transition has nothing to interpolate
 * across.
 */
export function MenuToggle() {
  const { open, toggle } = useMenu();

  return (
    <button
      type="button"
      className="menu-toggle"
      aria-expanded={open}
      aria-controls={PANEL_ID}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={toggle}
    >
      <span className="menu-toggle__bar menu-toggle__bar--top" aria-hidden />
      <span className="menu-toggle__bar menu-toggle__bar--mid" aria-hidden />
      <span className="menu-toggle__bar menu-toggle__bar--bot" aria-hidden />
    </button>
  );
}

/* --------------------------------------------------------------------------------------------
   The panel
   -------------------------------------------------------------------------------------------- */

/* The phone's menu carries one destination the desktop bar does not. Up there the three links sit
   in a row that has to stay short enough not to crowd the wordmark; down here they are a screen of
   their own, and the space that buys is what a fourth one costs. My Past is the section a visitor
   is least likely to reach by scrolling, since it sits below the whole of the work. */
const LINKS = [
  { label: "Work", href: "/#work", external: false },
  { label: "Resume", href: "/CV.pdf", external: true },
  { label: "My Past", href: "/#past", external: false },
  { label: "Contact", href: "/#contact", external: false },
];

/* The same three profiles the footer lists, minus Resume — which is one of the big links above,
   and does not want to be in the room twice. */
const SOCIALS = [
  { label: "GitHub", href: "https://github.com/pratiush776", Icon: GitHub },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pratiush-k-810324223",
    Icon: LinkedIn,
  },
  { label: "Email", href: "mailto:pratiush776@gmail.com", Icon: Mail },
];

/** Each line rides out of its own mask, on the footer signature's gesture. */
const lineRise = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: DUR.enter, ease: EASE } },
};

/* The contents start moving partway through the curtain rather than after it, which is the same
   trick the intro plays with its handoff — two gestures that overlap read as one, and two that
   queue read as a wait. */
const cascade = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: DUR.media * 0.45 },
  },
};

export function MenuPanel() {
  const { open, close } = useMenu();
  const reduce = useReducedMotion() ?? false;
  const router = useRouter();

  /**
   * A STOPPED LENIS REFUSES `scrollTo`. The hold that keeps the page still while the panel is up
   * is the same hold the intro uses, and it stops the instance outright — so a fragment link that
   * closed the menu and navigated in the same tick would find Lenis still stopped when Lenis'
   * own anchor handling tried to move, and `/#work` would simply do nothing.
   *
   * So the click is taken over here: close, let the curtain mostly run, and only then go. That is
   * better than a race won by a frame, and it reads as sequencing rather than as lag — the panel
   * shuts, and THEN the page is where you asked. The delay comes off the curtain's own duration
   * so the two can never drift apart.
   *
   * TWO DESTINATIONS, NOT ONE. `router.push("/#work")` moves the page only when the route
   * actually changes; called from `/` it is a no-op and the fragment is silently dropped, which
   * is the failure this split exists to avoid. On the landing page the hash is set directly — a
   * native jump, which a restarted Lenis adopts cleanly because it only ignores outside scrolls
   * while it believes itself mid-glide, and it has just been idle for the length of a curtain.
   * From a case page it is a real navigation and Next does the scrolling.
   */
  const go = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      close();

      const [path, hash] = href.split("#");
      const run = () => {
        if (hash && window.location.pathname === (path || "/")) {
          window.location.hash = hash;
        } else {
          router.push(href);
        }
      };

      if (reduce) run();
      else window.setTimeout(run, DUR.media * 1000 * 0.6);
    },
    [close, reduce, router],
  );

  return (
    <motion.div
      id={PANEL_ID}
      className="menu-panel"
      /* No entrance on mount — the closed clip is also declared in CSS, so the server's markup is
         already shut before this ever runs. */
      initial={false}
      animate={{
        clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
      }}
      transition={
        reduce ? { duration: 0 } : { duration: DUR.media, ease: EASE }
      }
      inert={!open}
    >
      <motion.div
        className="menu-panel__inner"
        variants={reduce ? undefined : cascade}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : open ? "visible" : "hidden"}
      >
        <nav className="menu-panel__links" aria-label="Menu">
          {LINKS.map(({ label, href, external }) => (
            <span className="menu-panel__clip" key={label}>
              <motion.span
                className="menu-panel__line"
                variants={reduce ? undefined : lineRise}
              >
                {/* Resume opens a PDF in its own tab, so this page never goes anywhere and the
                    panel can simply close under it — no handover, no delay. */}
                <a
                  className="menu-panel__link"
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  onClick={
                    external ? close : (event) => go(event, href)
                  }
                >
                  {label}
                </a>
              </motion.span>
            </span>
          ))}
        </nav>

        <motion.div
          className="menu-panel__socials"
          variants={reduce ? undefined : lineRise}
        >
          {SOCIALS.map(({ label, href, Icon }) => {
            const away = href.startsWith("http");
            return (
              <a
                key={label}
                className="menu-panel__social"
                href={href}
                aria-label={label}
                onClick={close}
                target={away ? "_blank" : undefined}
                rel={away ? "noopener noreferrer" : undefined}
              >
                <Icon width="20" height="20" aria-hidden />
              </a>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
