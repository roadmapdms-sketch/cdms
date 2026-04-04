/** Roles allowed to use the main CDMS shell (sidebar + module pages). */
export const LAYOUT_ALLOWED_ROLES = [
  'ADMIN',
  'ACCOUNTANT',
  'PASTOR',
  'VOLUNTEER_COORDINATOR',
  'STAFF',
  'VOLUNTEER',
  'USER',
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
  { name: 'Attendance', href: '/attendance', icon: '✅' },
  { name: 'Financial', href: '/financial', icon: '💰', financeOnly: true },
  { name: 'Events', href: '/events', icon: '📅' },
  { name: 'Communications', href: '/communications', icon: '📧' },
  { name: 'Volunteers', href: '/volunteers', icon: '🤝' },
  { name: 'Pastoral Care', href: '/pastoral-care', icon: '🙏' },
  { name: 'Inventory', href: '/inventory', icon: '📦' },
  { name: 'Expenses', href: '/expenses', icon: '🧾', financeOnly: true },
  { name: 'Vendors', href: '/vendors', icon: '🏢', financeOnly: true },
  { name: 'Budget', href: '/budget', icon: '📈', financeOnly: true },
  { name: 'Reports', href: '/reports', icon: '📋' },
];

export function sidebarItemsForRole(role: string | undefined): SidebarNavItem[] {
  if (!role) return ALL_SIDEBAR_ITEMS;
  return ALL_SIDEBAR_ITEMS.filter((item) => !item.financeOnly || canAccessFinanceModules(role));
}

export function getDefaultHomePath(role: string | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'ACCOUNTANT':
      return '/accountant';
    case 'PASTOR':
      return '/pastor';
    case 'VOLUNTEER_COORDINATOR':
      return '/volunteer';
    case 'MEMBER':
      return '/user';
    default:
      return '/dashboard';
  }
}
