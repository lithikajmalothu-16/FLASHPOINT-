import type { SVGProps } from 'react';

export const FlashpointIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2.69l-3.37 3.37" />
    <path d="M12 2.69l3.37 3.37" />
    <path d="M14.5 13.5A6.5 6.5 0 1 1 7.5 7.5a6.51 6.51 0 0 1 2.44.44" />
    <path d="M12 12.5V2.69" />
    <path d="M9 17.25a3 3 0 0 1 6 0" />
    <path d="M12 22v-4.75" />
    <path d="M8 12.5a6.47 6.47 0 0 0-4.5 4.75" />
    <path d="M16 12.5a6.47 6.47 0 0 1 4.5 4.75" />
  </svg>
);
