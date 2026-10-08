import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { PERSON, SITE_TITLE } from "@/lib/site";

/**
 * The link-preview card — what LinkedIn, iMessage, Slack and email show when the site is shared.
 * Built from the page's own parts: the wordmark in Kumbh on bone, a caps label above it, the name
 * and the address quiet underneath. Rendered once at build time.
 *
 * The fonts are static subsets committed in src/assets/og, holding only the glyphs set here. The
 * renderer cannot read variable fonts or woff2, and fetching from Google at build time would make
 * every deploy depend on it. Change the words below and the subsets must be cut again with them.
 */

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The page's tokens, restated: this renders outside the stylesheet, so it cannot read them. */
const BONE = "#efedea";
const INK = "#191919";
const INK_MUTED = "#666666";

/* Sized to fill the 1040px measure: "PRATIUSH" is 5.08em of advance in Kumbh 700, less the
   -0.03em display tracking between its letters, so 204px sets it about 990px wide. */
const WORD_SIZE = 204;

export default async function OpengraphImage() {
  const font = (file: string) =>
    readFile(join(process.cwd(), "src/assets/og", file));
  const [kumbh, medium, regular] = await Promise.all([
    font("KumbhSans-Bold.ttf"),
    font("InstrumentSans-Medium.ttf"),
    font("InstrumentSans-Regular.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BONE,
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: "Instrument Sans",
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: "0.14em",
          }}
        >
          SOFTWARE ENGINEER
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 36,
          }}
        >
          <div
            style={{
              fontFamily: "Kumbh Sans",
              fontWeight: 700,
              fontSize: WORD_SIZE,
              lineHeight: 0.8,
              letterSpacing: "-0.03em",
              /* The stem pull every left-aligned display word on the site carries: Kumbh's caps
                 sit 0.0596em off their box at 700, and -0.04em brings the P's stem onto the
                 label's edge the same way the projects word and the footer signature do. */
              marginLeft: "-0.04em",
            }}
          >
            PRATIUSH
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Instrument Sans",
              fontWeight: 400,
              fontSize: 28,
              color: INK_MUTED,
            }}
          >
            <span>{`${PERSON.name} · ${PERSON.region}`}</span>
            <span>pratiush.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Kumbh Sans", data: kumbh, weight: 700, style: "normal" },
        { name: "Instrument Sans", data: medium, weight: 500, style: "normal" },
        { name: "Instrument Sans", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
