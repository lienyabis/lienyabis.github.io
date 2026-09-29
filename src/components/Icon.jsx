const paths = {
  server: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.66 3.58 3 8 3s8-1.34 8-3v-13" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </>
  ),
  tool: (
    <>
      <path d="M14.7 6.3a4 4 0 1 0 5 5L21 21H3l6.5-8.6" />
      <path d="M6.5 12.4 3 9l3.5-3.5 3.5 3.4" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  plug: (
    <>
      <path d="M9 3v6M15 3v6" />
      <path d="M6 9h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V9Z" />
      <path d="M12 18v3" />
    </>
  ),
  rocket: (
    <>
      <path d="M5 15c-1.5 1.5-2 6-2 6s4.5-.5 6-2" />
      <path d="M13.5 15.5 8.5 10.5c1-4 4.5-7 9-8 1.5-.3 4 2.5 4 4-.5 4.5-3.5 8-8 9Z" />
      <circle cx="15" cy="9" r="1.4" />
    </>
  ),
  broom: (
    <>
      <path d="M14 4 20 10M12 6l6 6" />
      <path d="M14 12l-4 4M9.5 13.5 6 17M6 21c2.5 0 4.5-.5 6-2l-3-3c-1.5 1.5-2 3.5-3 5Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 20v-6M13 20V8M18 20v-9" />
    </>
  ),
  arrowUp: <path d="M12 20V4m0 0-7 7m7-7 7 7" />,
  arrowRight: <path d="M4 12h16m0 0-6-6m6 6-6 6" />,
  arrowDown: <path d="M12 4v16m0 0 7-7m-7 7-7-7" />,
  download: (
    <>
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3.4 12 11 19.6 18.4 20a1.5 1.5 0 0 0 1.6-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-2.4-.5a1.5 1.5 0 0 0-1.5.6l-.8 1a12.4 12.4 0 0 1-4.7-4.7l1-.8a1.5 1.5 0 0 0 .6-1.5l-.5-2.4A1.5 1.5 0 0 0 9 3Z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 13 4 4L19 7" />,
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
    </>
  ),
  cap: (
    <>
      <path d="m2 9 10-4.5L22 9l-10 4.5L2 9Z" />
      <path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  quote: (
    <path d="M9 6C6.2 7.4 4.5 10 4.5 13.2 4.5 16 6 18 8.2 18c1.8 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.6-2.8-.3 0-.6 0-.8.1.3-1.5 1.4-2.9 3-3.8L9 6Zm9 0c-2.8 1.4-4.5 4-4.5 7.2C13.5 16 15 18 17.2 18c1.8 0 3-1.2 3-2.9 0-1.6-1.1-2.8-2.6-2.8-.3 0-.6 0-.8.1.3-1.5 1.4-2.9 3-3.8L18 6Z" />
  ),
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />,
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.6 }) {
  const path = paths[name] || paths.sparkles;
  return (
    <svg
      className={`icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}
