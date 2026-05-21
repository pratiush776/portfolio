export function LocationPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.5 1C3.46 1 1 3.46 1 6.5C1 10.375 6.5 15 6.5 15S12 10.375 12 6.5C12 3.46 9.54 1 6.5 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
