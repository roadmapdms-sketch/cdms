/**
 * Role groups for Express authorization (align with client `LAYOUT_ALLOWED_ROLES` / dashboards).
 * MEMBER is intentionally omitted: no access to staff module APIs (use /api/auth/* until member routes exist).
 */

export const STAFF_MODULE_ROLES: string[] = [
  'ADMIN',
  'ACCOUNTANT',
  'PASTOR',
  'VOLUNTEER_COORDINATOR',
  'STAFF',
  'VOLUNTEER',
  'USER',
  'MEDIA_DEPARTMENT',
  'KITCHEN_RESTAURANT',
  'MANAGEMENT',
  'USHER_MANAGEMENT',
  'PARTNERS_COORDINATOR',
  'PRAYER_LINE_COORDINATOR',
];

/** Giving, budgets, vendors, expenses — finance team + admin only. */
export const FINANCE_CORE_ROLES: string[] = ['ADMIN', 'ACCOUNTANT'];

/** Self-service signup may only receive these roles (never ADMIN, etc.). */
export const REGISTRATION_ALLOWED_ROLES: string[] = ['USER', 'MEMBER'];
