import type { AllowedPostLoginPath } from '../utils/allowedRedirects';

export interface PortalDetail {
  slug: string;
  label: string;
  headline: string;
  summary: string;
  /** Post-login path (must stay in allowed list). */
  loginRedirect: AllowedPostLoginPath;
  icon: string;
  highlights: string[];
  /** Shown near registration—self-signup is usually USER/MEMBER only. */
  accessNote: string;
}

export const PORTAL_DETAILS: PortalDetail[] = [
  {
    slug: 'admin',
    label: 'Administrator',
    icon: '🛡️',
    headline: 'Central command for the entire DMS',
    summary:
      'Oversee every ministry portal, monitor activity, open any module, and keep users and data aligned with Roadmap Ministry International policies.',
    loginRedirect: '/admin',
    highlights: [
      'Organization-wide KPIs, budgets, and attendance signals',
      'Portal roster view: who holds each coordinator role',
      'Live cross-ministry activity feed',
      'Full operations console and finance tools',
    ],
    accessNote:
      'Administrator accounts are created only by your organization’s lead. If you need access, contact your senior leader.',
  },
  {
    slug: 'finance',
    label: 'Finance & accounting',
    icon: '💰',
    headline: 'Stewardship, budgets, and compliance in one place',
    summary:
      'Live budget, expenses, vendors, giving, budget planning workflow, and builders (pledges)—without unrelated ministry modules in this portal.',
    loginRedirect: '/accountant',
    highlights: [
      'Giving & income, expenses, vendors, and live departmental budget',
      'Budget planning workflow before the live fiscal year',
      'Builders and capital campaign / pledge tracking',
      'Approvals and ledger views scoped to finance work',
    ],
    accessNote:
      'Accountant and finance roles are assigned by an administrator. Self-registration starts as a general user until your role is updated.',
  },
  {
    slug: 'pastor',
    label: 'Pastoral leadership',
    icon: '🙏',
    headline: 'Shepherding workflows without unrelated ministry modules',
    summary:
      'Pastoral care, members, prayer line coverage, partners, and communications—this portal stays on people and care, not finance or operations consoles.',
    loginRedirect: '/pastor',
    highlights: [
      'Pastoral care records and follow-up',
      'Members directory for visits and context',
      'Prayer line coverage and intercessor alignment',
      'Partners and covenant relationships',
      'Communications to the flock',
    ],
    accessNote:
      'Pastoral and staff roles are issued by your administrator. Register first if invited, then sign in once your role is set.',
  },
  {
    slug: 'volunteer',
    label: 'Volunteer coordination',
    icon: '🙌',
    headline: 'Rosters, opportunities, and serving schedules',
    summary:
      'Coordinate teams across ministries, align with events, and keep communications tight so no serve slot is left open.',
    loginRedirect: '/volunteer',
    highlights: [
      'Volunteer roster and opportunity tracking',
      'Tight integration with events and attendance',
      'Team communications from one console',
    ],
    accessNote:
      'Volunteer coordinator access is assigned by an administrator after you have an account.',
  },
  {
    slug: 'media',
    label: 'Media department',
    icon: '🎬',
    headline: 'Production, comms, and AV in sync',
    summary:
      'Plan rundowns, align with the event calendar, track AV inventory, and keep volunteer tech teams coordinated.',
    loginRedirect: '/media',
    highlights: [
      'Communications and event schedule alignment',
      'Inventory for gear and room resources',
      'Volunteer lists for technical roles',
      'Reporting dashboard for ministry metrics',
    ],
    accessNote:
      'Media department accounts are assigned by an administrator.',
  },
  {
    slug: 'kitchen',
    label: 'Kitchen & restaurant',
    icon: '🍽️',
    headline: 'Hospitality operations from prep to guest stays',
    summary:
      'Tie meal service to the event calendar, manage hospitality inventory, volunteers, and guest facilities together.',
    loginRedirect: '/kitchen',
    highlights: [
      'Events as anchors for meals and catering windows',
      'Supplies and par levels in inventory',
      'Volunteer serving teams',
      'Guest house and hostels where your deployment enables them',
    ],
    accessNote:
      'Kitchen & restaurant portal access is assigned by an administrator.',
  },
  {
    slug: 'management',
    label: 'Management',
    icon: '📊',
    headline: 'Leadership visibility without diving into every ledger',
    summary:
      'See reporting dashboards, members, events, partners, and communications—ideal for executive oversight.',
    loginRedirect: '/management',
    highlights: [
      'Cross-module reporting and reports library',
      'Members, events, and partners at a glance',
      'Communications for leadership announcements',
    ],
    accessNote:
      'Management portal roles are assigned by an administrator.',
  },
  {
    slug: 'ushers',
    label: 'Usher management',
    icon: '🚪',
    headline: 'Guest experience from curb to seat',
    summary:
      'Attendance, events, usher teams, member lookup, and communications so every service feels welcoming and organized.',
    loginRedirect: '/ushers',
    highlights: [
      'Check-in and attendance signals',
      'Event schedule and volunteer posts',
      'Member lookup for seating and care',
    ],
    accessNote:
      'Usher management roles are assigned by an administrator.',
  },
  {
    slug: 'ministry-partners',
    label: 'Ministry partners',
    icon: '🤝',
    headline: 'Covenant partners and strategic relationships',
    summary:
      'Maintain the partner directory, renewal rhythms, and communications so relationships stay intentional.',
    loginRedirect: '/ministry-partners',
    highlights: [
      'Partner records and touchpoints',
      'Member context and pastoral links where needed',
      'Events and communications for partner engagement',
    ],
    accessNote:
      'Partners coordinator access is assigned by an administrator.',
  },
  {
    slug: 'prayer-line-portal',
    label: 'Prayer line',
    icon: '📞',
    headline: 'Coverage, intercessors, and handoffs to pastoral care',
    summary:
      'Schedule slots, roster intercessors, and bridge urgent needs into pastoral care and communications.',
    loginRedirect: '/prayer-line-portal',
    highlights: [
      'Prayer line scheduling workspace',
      'Volunteer and member context',
      'Communications for call trees and SMS where configured',
    ],
    accessNote:
      'Prayer line coordinator access is assigned by an administrator.',
  },
  {
    slug: 'reporting',
    label: 'Reporting dashboard',
    icon: '📉',
    headline: 'KPIs and operational reports',
    summary:
      'After sign-in, use the reporting dashboard and reports library from the operations console with the modules your role allows.',
    loginRedirect: '/dashboard',
    highlights: [
      'Cross-module KPIs',
      'Detailed operational and financial report views (role-based)',
      'Works alongside your assigned portal sidebar',
    ],
    accessNote:
      'Staff operations access is assigned by an administrator. New accounts typically start as USER until updated.',
  },
  {
    slug: 'hospitality',
    label: 'Hostels & guest house',
    icon: '🛏️',
    headline: 'Reservations, occupancy, and housekeeping',
    summary:
      'Use the staff operations console for hostels and guest-house modules once your account has access.',
    loginRedirect: '/dashboard',
    highlights: [
      'Beds, blocks, and reservations',
      'Guest services and housekeeping queues',
      'Tied to events and communications as you configure them',
    ],
    accessNote:
      'Hospitality modules require staff access granted by an administrator.',
  },
  {
    slug: 'builders',
    label: 'Builders (campaigns)',
    icon: '🏗️',
    headline: 'Capital campaigns and builder cohorts',
    summary:
      'Track pledges and campaign phases from the operations console; finance roles also see builders inside the finance portal.',
    loginRedirect: '/dashboard',
    highlights: [
      'Builders module in the staff console',
      'Links to budget and giving where your role permits',
    ],
    accessNote:
      'Campaign tools are limited to authorized staff and finance roles.',
  },
  {
    slug: 'member',
    label: 'Member portal',
    icon: '👤',
    headline: 'Your personal ministry hub',
    summary:
      'View your schedule, giving snapshot, and updates meant for members—not the full staff operations stack.',
    loginRedirect: '/user',
    highlights: [
      'Personal dashboard and involvement snapshot',
      'Event awareness where published',
      'Member-appropriate giving visibility',
    ],
    accessNote:
      'You can self-register as a member when your church enables it, or an administrator can create your account.',
  },
  {
    slug: 'staff',
    label: 'Staff operations',
    icon: '⚙️',
    headline: 'The shared operations console',
    summary:
      'Full sidebar of modules—events, inventory, volunteers, communications, and more—scoped to what your role is allowed to open.',
    loginRedirect: '/dashboard',
    highlights: [
      'Central dashboard for staff and coordinators',
      'Module access follows your assigned role',
      'Works with reporting, partners, prayer line, and hospitality when enabled',
    ],
    accessNote:
      'Staff roles are assigned by an administrator after account creation.',
  },
];

const BY_SLUG = Object.fromEntries(PORTAL_DETAILS.map((p) => [p.slug, p]));

export function getPortalDetail(slug: string | undefined): PortalDetail | undefined {
  if (!slug) return undefined;
  return BY_SLUG[slug];
}
