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
   * The panel's heading, as exactly two lines: the organisation, then the role or qualification.
   * Two lines rather than one sentence because the four panels then share a shape — the eye
   * finds "where" and "what" in the same place every time instead of reading a paragraph to
   * locate them.
   */
  lines: [string, string];
  /** When, in small type under the heading. Absent only where there is no date to state. */
  period?: string;
  /** The specifics, one per line. Quiet meta rather than prose. */
  detail: string[];
  /** Present only where the claim is publicly verifiable — currently the thesis alone. */
  link?: { label: string; href: string };
};

export const past: PastChapter[] = [
  {
    id: "education",
    word: "Education",
    lines: [
      "Caldwell University",
      "B.S. Computer Science, minor in Business Analytics",
    ],
    period: "May 2026",
    detail: [
      "Honors Program · Dean's List · Presidential Scholarship · Recognition Award",
      "Secretary, Computer Science Club",
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
    lines: ["Honors Thesis", "Available on JSTOR"],
    detail: ["Caldwell University Honors Program"],
    // Named for its destination rather than the click. "Click here" tells a screen reader
    // nothing when links are read out of context, and the arrow already says it is a link
    // leaving the site — so the words are free to say what is at the other end.
    link: {
      label: "Read the thesis",
      href: "https://www.jstor.org/stable/community.42398302",
    },
  },
];
