/** Roles allowed to use the main DMS operations shell (sidebar + module pages). */
export const LAYOUT_ALLOWED_ROLES = [
  'ADMIN',
  'ACCOUNTANT',
  'PASTOR',
  'VOLUNTEER_COORDINATOR',
  'STAFF',
  'MEDIA_DEPARTMENT',
  'KITCHEN_RESTAURANT',
  'MANAGEMENT',
  'USHER_MANAGEMENT',
  'PARTNERS_COORDINATOR',
  'PRAYER_LINE_COORDINATOR',
] as const;

/** Matches server `FINANCE_CORE_ROLES` — financial, budget, vendors, expenses APIs. */
export const FINANCE_ALLOWED_ROLES = ['ADMIN', 'ACCOUNTANT'] as const;

export type LayoutRole = (typeof LAYOUT_ALLOWED_ROLES)[number];

export function canAccessFinanceModules(role: string | undefined): boolean {
  return !!role && (FINANCE_ALLOWED_ROLES as readonly string[]).includes(role);
}

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: string;
  /** If true, only ADMIN + ACCOUNTANT see this link. */
  financeOnly?: boolean;
}

const ALL_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Members', href: '/members', icon: '👥' },
  { name: 'Partners', href: '/partners', icon: '🤝' },
  { name: 'Attendance', href: '/attendance', icon: '✅' },
  { name: 'Financial', href: '/financial', icon: '💰', financeOnly: true },
  { name: 'Events', href: '/events', icon: '📅' },
  { name: 'Communications', href: '/communications', icon: '📧' },
  { name: 'Volunteers', href: '/volunteers', icon: '🙌' },
  { name: 'Pastoral Care', href: '/pastoral-care', icon: '🙏' },
  { name: 'Prayer line', href: '/prayer-line', icon: '📞' },
  { name: 'Inventory', href: '/inventory', icon: '📦' },
  { name: 'Expenses', href: '/expenses', icon: '🧾', financeOnly: true },
  { name: 'Vendors', href: '/vendors', icon: '🏢', financeOnly: true },
  { name: 'Budget', href: '/budget', icon: '💹', financeOnly: true },
  { name: 'Budget planning', href: '/budget-planning', icon: '📐', financeOnly: true },
  { name: 'Builders', href: '/builders', icon: '🏗️' },
  { name: 'Hostels', href: '/hostels', icon: '🛏️' },
  { name: 'Guest house', href: '/guest-house', icon: '🏠' },
  { name: 'Reports', href: '/reports', icon: '📋' },
  { name: 'Reporting dashboard', href: '/reporting-dashboard', icon: '📉' },
];

export function sidebarItemsForRole(role: string | undefined): SidebarNavItem[] {
  if (!role) return ALL_SIDEBAR_ITEMS;
  return ALL_SIDEBAR_ITEMS.filter((item) => !item.financeOnly || canAccessFinanceModules(role));
}

/** Roles that use a dedicated portal home (not /dashboard) with their own sidebar module list. */
const INDEPENDENT_PORTAL_ROLES = new Set<string>([
  'ADMIN',
  'ACCOUNTANT',
  'PASTOR',
  'STAFF',
  'VOLUNTEER_COORDINATOR',
  'MEDIA_DEPARTMENT',
  'KITCHEN_RESTAURANT',
  'MANAGEMENT',
  'USHER_MANAGEMENT',
  'PARTNERS_COORDINATOR',
  'PRAYER_LINE_COORDINATOR',
]);

export function hasIndependentPortalNav(role: string | undefined): boolean {
  return !!role && INDEPENDENT_PORTAL_ROLES.has(role);
}

function portalHomeNavItem(role: string): SidebarNavItem {
  return { name: 'Portal home', href: getDefaultHomePath(role), icon: '🏠' };
}

function modulesByHref(hrefs: string[]): SidebarNavItem[] {
  return hrefs
    .map((h) => ALL_SIDEBAR_ITEMS.find((i) => i.href === h))
    .filter((x): x is SidebarNavItem => !!x);
}

const OPS_HUB: SidebarNavItem = { name: 'Operations hub', href: '/dashboard', icon: '📊' };

/**
 * Left sidebar for dedicated portals: only modules relevant to that role (not every admin module).
 */
export function independentPortalSidebar(role: string): SidebarNavItem[] {
  const home = portalHomeNavItem(role);

  switch (role) {
    case 'ADMIN':
      return [
        home,
        OPS_HUB,
        ...ALL_SIDEBAR_ITEMS.filter(
          (i) => i.href !== '/dashboard' && (!i.financeOnly || canAccessFinanceModules(role))
        ),
      ];
    case 'ACCOUNTANT':
      return [
        home,
        ...modulesByHref([
          '/financial',
          '/expenses',
          '/vendors',
          '/budget',
          '/budget-planning',
          '/builders',
        ]),
      ];
    case 'PASTOR':
    case 'STAFF':
      return [
        home,
        ...modulesByHref([
          '/pastoral-care',
          '/members',
          '/prayer-line',
          '/partners',
          '/communications',
        ]),
      ];
    case 'VOLUNTEER_COORDINATOR':
      return [
        home,
        ...modulesByHref([
          '/volunteers',
          '/events',
          '/members',
          '/attendance',
          '/communications',
          '/reports',
          '/reporting-dashboard',
        ]),
      ];
    case 'MEDIA_DEPARTMENT':
      return [
        home,
        ...modulesByHref([
          '/communications',
          '/events',
          '/inventory',
          '/volunteers',
          '/reporting-dashboard',
          '/reports',
        ]),
      ];
    case 'KITCHEN_RESTAURANT':
      return [
        home,
        ...modulesByHref([
          '/events',
          '/inventory',
          '/volunteers',
          '/communications',
          '/guest-house',
          '/hostels',
        ]),
      ];
    case 'MANAGEMENT':
      return [
        home,
        ...modulesByHref([
          '/reporting-dashboard',
          '/reports',
          '/members',
          '/events',
          '/partners',
          '/communications',
        ]),
      ];
    case 'USHER_MANAGEMENT':
      return [
        home,
        ...modulesByHref([
          '/attendance',
          '/events',
          '/volunteers',
          '/members',
          '/communications',
          '/reports',
        ]),
      ];
    case 'PARTNERS_COORDINATOR':
      return [
        home,
        ...modulesByHref([
          '/partners',
          '/members',
          '/communications',
          '/events',
          '/pastoral-care',
          '/reports',
        ]),
      ];
    case 'PRAYER_LINE_COORDINATOR':
      return [
        home,
        ...modulesByHref([
          '/prayer-line',
          '/pastoral-care',
          '/volunteers',
          '/communications',
          '/members',
          '/reports',
        ]),
      ];
    default:
      return sidebarItemsForRole(role);
  }
}

/** Sidebar for Layout + role portals: independent list per dedicated portal, otherwise full staff list. */
export function navItemsForStaffSession(role: string | undefined): SidebarNavItem[] {
  if (!role) return ALL_SIDEBAR_ITEMS;
  if (hasIndependentPortalNav(role)) {
    return independentPortalSidebar(role);
  }
  return sidebarItemsForRole(role);
}

/** Short label under “DMS” in the staff shell sidebar. */
export function staffShellSidebarTagline(role: string | undefined): string {
  if (!role) return 'DMS';
  if (!hasIndependentPortalNav(role)) return 'Operations console';
  switch (role) {
    case 'ADMIN':
      return 'Administrator portal';
    case 'ACCOUNTANT':
      return 'Finance portal';
    case 'PASTOR':
    case 'STAFF':
      return 'Pastoral portal';
    case 'VOLUNTEER_COORDINATOR':
      return 'Volunteers portal';
    case 'MEDIA_DEPARTMENT':
      return 'Media portal';
    case 'KITCHEN_RESTAURANT':
      return 'Kitchen & hospitality';
    case 'MANAGEMENT':
      return 'Management portal';
    case 'USHER_MANAGEMENT':
      return 'Usher portal';
    case 'PARTNERS_COORDINATOR':
      return 'Partners portal';
    case 'PRAYER_LINE_COORDINATOR':
      return 'Prayer line portal';
    default:
      return 'Your portal';
  }
}

export function getDefaultHomePath(role: string | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'ACCOUNTANT':
      return '/accountant';
    case 'PASTOR':
    case 'STAFF':
      return '/pastor';
    case 'VOLUNTEER_COORDINATOR':
      return '/volunteer';
    case 'MEMBER':
    case 'USER':
    case 'VOLUNTEER':
      return '/user';
    case 'MEDIA_DEPARTMENT':
      return '/media';
    case 'KITCHEN_RESTAURANT':
      return '/kitchen';
    case 'MANAGEMENT':
      return '/management';
    case 'USHER_MANAGEMENT':
      return '/ushers';
    case 'PARTNERS_COORDINATOR':
      return '/ministry-partners';
    case 'PRAYER_LINE_COORDINATOR':
      return '/prayer-line-portal';
    default:
      return '/user';
  }
}
