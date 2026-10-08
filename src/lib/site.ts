/** The canonical host. The bare domain answers with a redirect to it, so it is the one search
    engines are told about — by the sitemap, robots.txt and the landing page's canonical link. */
export const SITE_URL = "https://www.pratiush.com";

/** Who the site is, as search results and link previews state it. The title leads with the full
    name because that is what people search for; the all-caps wordmark is the site's own voice and
    stays on the page. */
export const PERSON = {
  name: "Pratiush Karki",
  role: "Software Engineer",
  region: "New Jersey",
} as const;

export const SITE_TITLE = `${PERSON.name} — ${PERSON.role}`;
export const SITE_DESCRIPTION = `${PERSON.name} is a software engineer who turns rough ideas into polished products: full-stack web apps, AI tools and real-time systems. Based in ${PERSON.region}.`;

/** The public profiles, shared by the footer, the phone menu and the landing page's structured
    data, so the three can never disagree about where he is. */
export const GITHUB_URL = "https://github.com/pratiush776";
export const LINKEDIN_URL = "https://www.linkedin.com/in/pratiush-k-810324223";
