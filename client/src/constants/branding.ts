/** Served from `public/branding/` — avoids bundling so TS never resolves a missing `.png` import. */
export const RMI_HERO_LOGO_URL = `${process.env.PUBLIC_URL || ''}/branding/rmi-hero-logo.png`;

/** Roadmap Ministry International — official gold palette (use in Tailwind as arbitrary hex or map to CSS vars). */
export const RMI_PALETTE = {
  goldPrimary: '#c9a227',
  goldLight: '#e8c547',
  goldWarm: '#f4e4a8',
  cream: '#f5e6b8',
} as const;
