# CLAUDE.md

## Rules

- Do not touch the `main` branch without my permission. Work happens on `design_v5`.
- Verification: do code-level checks only — typecheck, lint, build, security/sanity, clean
  code, breaking-change/bug review. Do NOT do visual verification or screenshot workarounds
  (headless Chrome, static-HTML previews, etc.) when I am here; I will eyeball the UI
  myself. Just tell me when it's ready to look at.
- Do not start a dev server for this project; I keep one running. If the sandbox cannot
  reach it, ask me to verify or run the needed command instead of trying workarounds.
- Fonts: define every face in `src/lib/fonts.ts` (`next/font` or `localFont`) exposing a CSS
  variable, and use that next/font variable DIRECTLY in `font-family` (e.g.
  `var(--font-sentient), Georgia, serif`). Never route a `font-family` through an
  intermediate `@theme`/`:root` alias — those have silently dropped to the fallback face.

## Project

Personal portfolio site. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4,
Motion + GSAP, `next-video`. Deployed on Vercel.

`src/data/works.ts` and `src/data/capabilities.ts` hold the real content. `public/` holds the
project imagery, video posters, and tech logos. Self-hosted faces live in `src/fonts/`.

Web3Forms must be called client-side — the API blocks server-side requests. Keys are in
`.env.local`.
