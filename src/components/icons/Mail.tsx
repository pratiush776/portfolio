/**
 * The envelope. This one IS a stroke, on ArrowUpRight's 2px weight, because it is a generic
 * pictogram rather than a brand mark — nothing about "email" requires a particular silhouette,
 * so it can sit on the site's own line weight instead of importing someone else's.
 */
export function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="2"
        y="4.5"
        width="20"
        height="15"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 6l9 6.5L21 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
