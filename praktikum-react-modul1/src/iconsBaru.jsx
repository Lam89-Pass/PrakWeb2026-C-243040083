import { icons } from "./icons";

const Svg = ({ size = 22, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const GlobeIcon = ({ size = 18 }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export const ChevronIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const CheckIcon = ({ size = 34 }) => (
  <Svg size={size}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);

export const MailIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="m22 6-10 7L2 6" />
  </Svg>
);

export const InstagramIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Svg>
);

export const LinkedinIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
);

export const ExternalIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);

export const projectIcons = {
  ...icons,
  code: (
    <Svg>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </Svg>
  ),
  filter: (
    <Svg>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />
    </Svg>
  ),
  ai: (
    <Svg>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="m19 16 .7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
    </Svg>
  ),
  laptop: (
    <Svg>
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </Svg>
  ),
  shield: (
    <Svg>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  ),
  heart: (
    <Svg>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </Svg>
  ),
  mail: (
    <Svg>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </Svg>
  ),
  book: (
    <Svg>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </Svg>
  ),
  user: (
    <Svg>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </Svg>
  ),
};

export const IdIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M14 10h4M14 14h4M6 16c.5-1.5 2-2 3-2s2.5.5 3 2" />
  </Svg>
);

export const StatusIcon = ({ size = 20 }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Svg>
);