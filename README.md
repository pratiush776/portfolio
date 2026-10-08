# portfolio

Personal portfolio site.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Motion · Lenis

## Running

```bash
npm install
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Environment

One key, in `.env.local` (gitignored) and in the Vercel project's environment variables:

```
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
```

Web3Forms must be called from the client — the API blocks server-side requests.

## SEO

Only the landing page is meant to appear in search. Case pages are `noindex, follow` and left out
of `/sitemap.xml`, but stay crawlable in `/robots.txt` so Google can read the noindex. Both files
are generated from `src/app/sitemap.ts` and `src/app/robots.ts`; the canonical host lives in
`src/lib/site.ts`. Google Search Console verifies the domain by a DNS
TXT record in Vercel (Domains → pratiush.com → DNS Records) — keep that record, Google re-checks it.

## Layout

```
src/app/         routes, layout, globals.css
src/components/  UI
src/data/        work + background content
src/lib/         fonts, motion helpers
src/fonts/       self-hosted faces
public/          images, project demos and posters
```

## Branches

- `main` — deployed
- `design_v5` — active redesign
