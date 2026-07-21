# portfolio

Personal portfolio site.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Motion + GSAP · `next-video`

## Running

```bash
npm install
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Environment

Copy the required keys into `.env.local` (gitignored):

```
NEXT_PUBLIC_API_URL
WEB3FORMS_ACCESS_KEY
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
```

Web3Forms must be called from the client — the API blocks server-side requests.

## Layout

```
src/app/         routes, layout, globals.css
src/components/  UI
src/data/        works + capabilities content
src/lib/         fonts, motion helpers
src/fonts/       self-hosted faces
public/          images, video posters, logos
```

## Branches

- `main` — deployed
- `design_v5` — active redesign
