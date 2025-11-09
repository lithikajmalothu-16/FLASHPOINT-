import type { SVGProps } from 'react';

export const FlashpointIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3.5 4.5L12 2L20.5 4.5V10.5C20.5 16.5 17 21 12 22C7 21 3.5 16.5 3.5 10.5V4.5Z" />
    <path d="M10.5 15.5L13.5 9.5L9 9.5L11.5 6.5" />
    <circle cx="12" cy="12" r="4.5" />
  </svg>
);


export const AnalyticsIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M3 3v18h18" />
    <path d="M7 12v5" />
    <path d="M12 8v9" />
    <path d="M17 4v13" />
  </svg>
);

export const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);
