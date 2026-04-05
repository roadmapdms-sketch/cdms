import { LAYOUT_ALLOWED_ROLES } from './roles';

/** Paths the login page may redirect to after a successful sign-in (open-redirect safe). */
export const ALLOWED_POST_LOGIN_PATHS = [
  '/admin',
  '/accountant',
  '/pastor',
  '/volunteer',
  '/user',
  '/dashboard',
  '/media',
  '/kitchen',
  '/management',
] as const;

export type AllowedPostLoginPath = (typeof ALLOWED_POST_LOGIN_PATHS)[number];

export function getSafeRedirectParam(raw: string | null): AllowedPostLoginPath | null {
  if (!raw) return null;
  const path = raw.split('?')[0];
  return (ALLOWED_POST_LOGIN_PATHS as readonly string[]).includes(path)
    ? (path as AllowedPostLoginPath)
    : null;
}

export function canAccessPortalPath(path: AllowedPostLoginPath, role: string): boolean {
  switch (path) {
    case '/admin':
      return role === 'ADMIN';
    case '/accountant':
      return role === 'ACCOUNTANT' || role === 'ADMIN';
    case '/pastor':
      return role === 'PASTOR' || role === 'ADMIN' || role === 'STAFF';
    case '/volunteer':
      return role === 'VOLUNTEER_COORDINATOR' || role === 'ADMIN';
    case '/user':
      return role === 'MEMBER';
    case '/dashboard':
      return (LAYOUT_ALLOWED_ROLES as readonly string[]).includes(role);
    case '/media':
      return role === 'MEDIA_DEPARTMENT' || role === 'ADMIN';
    case '/kitchen':
      return role === 'KITCHEN_RESTAURANT' || role === 'ADMIN';
    case '/management':
      return role === 'MANAGEMENT' || role === 'ADMIN';
    default:
      return false;
  }
}
