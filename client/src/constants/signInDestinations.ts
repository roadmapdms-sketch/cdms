import type { AllowedPostLoginPath } from '../utils/allowedRedirects';

/** Grouped options for “where to go after sign-in” (must match allowed redirect paths). */
export const SIGN_IN_PORTAL_OPTIONS: {
  group: string;
  items: { value: AllowedPostLoginPath; label: string }[];
}[] = [
  {
    group: 'Leadership & oversight',
    items: [
      { value: '/admin', label: 'Administrator command center' },
      { value: '/management', label: 'Management portal' },
      { value: '/accountant', label: 'Finance & accounting' },
    ],
  },
  {
    group: 'Ministry portals',
    items: [
      { value: '/pastor', label: 'Pastoral leadership' },
      { value: '/volunteer', label: 'Volunteer coordination' },
      { value: '/media', label: 'Media department' },
      { value: '/kitchen', label: 'Kitchen & restaurant' },
      { value: '/ushers', label: 'Usher management' },
      { value: '/ministry-partners', label: 'Ministry partners' },
      { value: '/prayer-line-portal', label: 'Prayer line' },
    ],
  },
  {
    group: 'General access',
    items: [
      { value: '/dashboard', label: 'Operations console (upgraded staff only)' },
      { value: '/user', label: 'Member portal' },
    ],
  },
];

export const REGISTRATION_ACCOUNT_TYPES = [
  {
    value: 'MEMBER' as const,
    label: 'Member portal',
    description: 'Personal dashboard, schedule, and member-appropriate giving visibility.',
  },
  {
    value: 'USER' as const,
    label: 'General user',
    description: 'Starts in member portal until an administrator assigns an upgraded portal role.',
  },
] as const;
