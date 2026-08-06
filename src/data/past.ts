/**
 * MY PAST — where the work comes from, as four words you open.
 *
 * The loud word on each row is a CATEGORY, not a brand, and that is the whole reason this
 * section works where a logo bar would not. A logo bar runs on borrowed recognition: it needs
 * marks a visitor can place, and of everything here only the Jets is one. A category needs no
 * recognition at all — "EDUCATION" carries itself at any scale, in the page's own typeface,
 * with nothing borrowed.
 *
 * Closed, the four words are a list of claims. Open, each one has to pay for itself, and every
 * panel answers in the same order so the four read as one form rather than four write-ups:
 * where it was, what it was, when, then the specifics.
 */
export type PastChapter = {
  id: string;
  /** The word that stands at scale. Two words at most — it is set in caps and has to hold one
      line on a phone. */
  word: string;
  /**
   * The panel's heading, as exactly two lines: the thing, then what it is. Usually that reads as
   * the organisation and then the role; on the thesis, where there is no employer, it is the
   * paper's title and then "Honors Thesis". The SLOTS are what the four panels share, not the kind
   * of noun that fills them.
   *
   * Two lines rather than one sentence because that shared shape is the whole point — the eye finds
   * "what this was" and "what I was in it" in the same place every time instead of reading a
   * paragraph to locate them.
   */
  lines: [string, string];
  /** When, in small type under the heading. Absent only where there is no date to state. */
  period?: string;
  /** The specifics, one per line. Quiet meta rather than prose. Absent on the thesis, whose two
      heading lines and link already say everything there is to say about it. */
  detail?: string[];
  /** Present only where the claim is publicly verifiable — currently the thesis alone. */
  link?: { label: string; href: string };
  /**
   * Photographs of the place, shown inside the panel under the specifics.
   *
   * They sit at the END of the panel rather than the top, so all four panels still open the same
   * way — where, what, when, the specifics — and the eye finds each of those in the same position
   * whichever row it opened. A chapter with pictures simply has more after that, which is the one
   * way to add them without costing the other three their shared shape.
   *
   * `ratio` is the frame's aspect, and it is also what sizes the frame: the gallery lays its shots
   * out so they SHARE one height and take widths in proportion to their ratios, so a 1.5 sits
   * between two 1s as a wide centre panel without anything having to declare a column. Omit it for
   * a square, which is what most of them are.
   *
   * The frame crops from the middle out — a photo whose own ratio is taller than its frame loses an
   * equal band off the top and the bottom, and never its centre.
   *
   * `zoom` pushes into the picture inside a frame it already fits, for shots where the subject sits
   * small in a wide scene. 1 is the photograph as shot; it crops from the centre, like `ratio`.
   *
   * `blur` is an 8px WebP of the shot, inlined, and it is what stands in the frame while the real
   * file is in flight. The frame's box is already reserved by `ratio`, so nothing here is holding
   * the layout together — this is only so an opening panel shows the shape and colour of the
   * photograph rather than a grey rectangle. Regenerate it whenever the photograph changes; the
   * whole set costs under a kilobyte, which is why it can be inlined at all (the same thumbnails as
   * JPEG run seven times larger — at this size a file is nearly all header).
   */
  gallery?: {
    src: string;
    alt: string;
    ratio?: number;
    zoom?: number;
    blur: string;
  }[];
};

export const past: PastChapter[] = [
  {
    id: "education",
    word: "Education",
    // The GPA rides the end of the degree line rather than taking a row of its own below. It is
    // part of what the degree IS, not a separate specific about it — and given a line to itself it
    // read as the panel's headline number, which is more weight than a GPA should carry against
    // the degree it belongs to. Here it closes the sentence, where it is available to anyone
    // looking for it and quiet to everyone else.
    lines: [
      "Caldwell University",
      "B.S. Computer Science, minor in Business Analytics · 3.85 GPA",
    ],
    detail: [
      "Honors Student · Dean's List · Recognition Award · Co-founder & Secretary of Computer Science Club",
    ],
    // A triptych, with the graduation portrait held in the middle and given a wide frame — the
    // widest thing here, flanked by two squares at the same height. The other two are the two
    // halves of the line above it: the podium is the honours student, the club fair table is the
    // club he co-founded. The wide centre is a 3:2 cut of a 3:4 photograph, so it loses an equal
    // band off the top and the bottom and keeps the cap, the face and the diploma.
    gallery: [
      // The two squares are pushed in a quarter; the wide centre is not. Both flanking shots are
      // wide rooms with a small subject in them — a hall from the back, a table from across the
      // floor — and at a 199px frame the subject was a detail rather than the picture. The
      // graduation portrait needs none of it: its subject already fills the frame.
      {
        src: "/images/Edu_2.webp",
        blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoFAAgABABoJbACdAD0ofcU4kAA/ua/Nd7OFODuYbGTvAO/GqgLqmFhJ/KnguPx32IFvgMAAAA=",
        alt: "Speaking at a podium at a Caldwell University event.",
        zoom: 1.25,
      },
      {
        src: "/images/Edu_1.webp",
        blur: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoGAAgABABoJQBOgB6J4emTQAD+n7rtA5NiRZCajd4aSY2susfRLy42yDjxsWFK7oAAAA==",
        alt: "Pratiush at graduation in cap and gown, holding his Caldwell University diploma.",
        ratio: 1.5,
      },
      {
        src: "/images/Edu_3.webp",
        blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADQAQCdASoIAAgABABoJbACdAELMk0VYAD+tAl07IF8lvQMpKDcFYrVAMpK8Y+CdLM5wo/5Ndikl8bTdZIR3HcAAAA=",
        alt: "At the Computer Science Club table during the Caldwell University club fair.",
        zoom: 1.25,
      },
    ],
  },
  {
    id: "jets",
    // The Jets are the one name here a visitor will place, so the word is theirs. The detail
    // carries the collaboration rather than burying it: the role sat inside a Caldwell × Jets
    // team, and a bare "Data Analyst, New York Jets" would claim they employed him directly.
    word: "NY Jets",
    lines: ["New York Jets", "Data Analyst"],
    detail: [
      "A Caldwell University collaboration with the New York Jets.",
      "Worked as part of the analysis team on the club's data.",
    ],
    // A pair, and both are square as shot — so the frames crop nothing and the two sit as one
    // object. They also answer the two halves of the claim above: one is the work, one is the
    // place. The third shot from the visit is left out; three across this measure drops each of
    // them to a thumbnail, and a pair is the shape that keeps them at a size worth opening for.
    gallery: [
      {
        src: "/images/NYJETS_2.webp",
        blur: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAAAQAgCdASoIAAgABABoJQBOj+DE/wPl6riAAM19C/TUtzbnFSAXD0K5jwAIxMAZbskT8WQAAAA=",
        alt: "Presenting the fan-segment analysis to the room at the Jets facility.",
      },
      {
        src: "/images/NYJETS_3.webp",
        blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoIAAgABABoJZQCdADbGlAwAP6jZeFBdl4tnnqyLz0jbo0lYKs+YAJOxBcWVVAA",
        alt: "Pratiush on the practice field, the Jets logo on the facility behind him.",
      },
    ],
  },
  {
    id: "internship",
    word: "Internship",
    lines: ["Whisk It All", "Full-Stack Software Engineer"],
    period: "Summer 2025",
    detail: [
      "Designed, built and deployed the customer-facing production site.",
      "Owned it end to end, from design through to deployment.",
      "Worked directly with stakeholders to turn business needs into the build.",
    ],
  },
  {
    id: "research",
    word: "Research Paper",
    // The one row where the first line is not an organisation. A thesis has no employer — the
    // paper IS the thing, so it takes the heading slot and "Honors Thesis" drops to the line that
    // says what it is, exactly where a role sits on every other row. The panel's shape is
    // unchanged; only what fills it is. Where it was published used to live on this line and is
    // gone: the link below already says the paper can be read, and saying it twice made the
    // heading about a database rather than about the work.
    lines: ["AI Sycophancy and Human Cognitive Biases", "Honors Thesis"],
    // Named for its destination rather than the click. "Click here" tells a screen reader
    // nothing when links are read out of context, and the arrow already says it is a link
    // leaving the site — so the words are free to say what is at the other end.
    link: {
      label: "Read Paper",
      href: "https://www.jstor.org/stable/community.42398302",
    },
    // BOTH FRAMES TAKE THE LEFT ONE'S 4:3. Left at its native ratio and right at its own, the pair
    // came out a wide landscape beside a narrow portrait — two pictures of the same poster session
    // that read as two different things. Matching them makes it one pair, and the price is paid by
    // the portrait: a 3:4 photograph in a 4:3 frame loses an equal band off the top and the bottom,
    // and keeps the poster and him from the chest up.
    gallery: [
      {
        src: "/images/honors_1.webp",
        blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAgCdASoIAAYABABoJYgCdH8AGBi0ZldYAPRM0m0xcfgfZxb9/7aZLg4B3SnkP8vj3tjIxOHP4Ik24oAAAA==",
        alt: "Presenting the thesis poster at the Caldwell University research symposium.",
        ratio: 4 / 3,
      },
      {
        src: "/images/honors_2.webp",
        blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoGAAgABABoJagCdAEUmfIBQAD3276EXaMSj5h2pedn+55o5o9a2aFpmxLlcDNIIChsVtgAAAA=",
        alt: "Pratiush standing beside his thesis poster at the symposium.",
        ratio: 4 / 3,
      },
    ],
  },
];
