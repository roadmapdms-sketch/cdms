/** Served from `public/branding/` — avoids bundling so TS never resolves a missing `.png` import. */
export const RMI_HERO_LOGO_URL = `${process.env.PUBLIC_URL || ''}/branding/rmi-hero-logo.png`;
