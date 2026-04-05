import React from 'react';
import { Link } from 'react-router-dom';
import { RMI_HERO_LOGO_URL } from '../constants/branding';

const MODULES = [
  {
    title: 'Event Planning',
    desc: 'Service scheduling, registrations, and resource management',
    icon: '📅',
  },
  {
    title: 'Communication System',
    desc: 'Targeted SMS and email communications',
    icon: '📧',
  },
  {
    title: 'Volunteer Coordination',
    desc: 'Team management and scheduling',
    icon: '🤝',
  },
  {
    title: 'Pastoral Care',
    desc: 'Prayer requests, counseling, and visitation tracking',
    icon: '🙏',
  },
  {
    title: 'Prayer line',
    desc: 'Scheduled prayer coverage and call-in coordination',
    icon: '📞',
  },
  {
    title: 'Ministry partners',
    desc: 'Covenant partners, organizations, and strategic relationships',
    icon: '🤝',
  },
  {
    title: 'Builders',
    desc: 'Capital campaigns, pledge phases, and builder cohorts',
    icon: '🏗️',
  },
  {
    title: 'Inventory Management',
    desc: 'Asset tracking and maintenance',
    icon: '📦',
  },
  {
    title: 'Expense Accounting',
    desc: 'Operational expense tracking',
    icon: '🧾',
  },
  {
    title: 'Vendor Management',
    desc: 'Service provider records and contracts',
    icon: '🏢',
  },
  {
    title: 'Budget planning',
    desc: 'Annual planning workflow before the live budget module',
    icon: '📐',
  },
  {
    title: 'Live budget',
    desc: 'Department budgets, allocations, and spend tracking',
    icon: '💹',
  },
  {
    title: 'Reporting dashboard',
    desc: 'Cross-module KPIs plus detailed reports',
    icon: '📉',
  },
  {
    title: 'Reports library',
    desc: 'Detailed operational and financial report views',
    icon: '📋',
  },
  {
    title: 'Hostels',
    desc: 'Beds, blocks, occupancy, and reservations',
    icon: '🛏️',
  },
  {
    title: 'Guest house',
    desc: 'Nightly stays, housekeeping, and guest services',
    icon: '🏠',
  },
  {
    title: 'Security System',
    desc: 'Role-based access control and data protection',
    icon: '🔐',
  },
] as const;

const PORTALS: Array<{
  id: string;
  label: string;
  path: string;
  desc: string;
  highlight?: boolean;
}> = [
  {
    id: 'admin',
    label: 'Administrator',
    path: '/login?redirect=/admin',
    desc: 'Full system oversight, users, and every module in the operations console.',
    highlight: true,
  },
  {
    id: 'finance',
    label: 'Finance & accounting',
    path: '/login?redirect=/accountant',
    desc: 'Live budget, expenses, vendors, giving, budget planning workflow, and builders (pledges).',
  },
  {
    id: 'pastor',
    label: 'Pastoral leadership',
    path: '/login?redirect=/pastor',
    desc: 'Pastoral care, members, prayer line coverage, partners, and communications.',
  },
  {
    id: 'volunteer',
    label: 'Volunteer coordination',
    path: '/login?redirect=/volunteer',
    desc: 'Teams, rosters, events, and serving opportunities.',
  },
  {
    id: 'media',
    label: 'Media department',
    path: '/login?redirect=/media',
    desc: 'Production, communications, events, and AV inventory—sign in with a media department account.',
  },
  {
    id: 'kitchen',
    label: 'Kitchen & restaurant',
    path: '/login?redirect=/kitchen',
    desc: 'Hospitality operations: events, inventory, volunteers, and guest facilities.',
  },
  {
    id: 'management',
    label: 'Management',
    path: '/login?redirect=/management',
    desc: 'Leadership snapshot: reporting, members, events, and partners (finance detail stays in finance roles).',
  },
  {
    id: 'ushers',
    label: 'Usher management',
    path: '/login?redirect=/ushers',
    desc: 'Guest experience: attendance, events, usher teams, member lookup, and communications.',
  },
  {
    id: 'ministry-partners',
    label: 'Ministry partners',
    path: '/login?redirect=/ministry-partners',
    desc: 'Dedicated partners portal—directory, renewals, and comms (partners coordinator account).',
  },
  {
    id: 'prayer-line-portal',
    label: 'Prayer line',
    path: '/login?redirect=/prayer-line-portal',
    desc: 'Dedicated prayer line portal—slots, intercessors, and pastoral handoffs (prayer line coordinator account).',
  },
  {
    id: 'reporting',
    label: 'Reporting dashboard',
    path: '/login?redirect=/dashboard',
    desc: 'Cross-module KPIs plus the reports library—after sign-in use Reporting dashboard and Reports.',
  },
  {
    id: 'hospitality',
    label: 'Hostels & guest house',
    path: '/login?redirect=/dashboard',
    desc: 'Reservations, occupancy, and housekeeping for hostels and guest-house stays in the staff console.',
  },
  {
    id: 'builders',
    label: 'Builders (campaigns)',
    path: '/login?redirect=/dashboard',
    desc: 'Capital campaigns and builder cohorts from the staff operations console.',
  },
  {
    id: 'member',
    label: 'Member portal',
    path: '/login?redirect=/user',
    desc: 'Personal schedule, giving, and updates.',
  },
  {
    id: 'staff',
    label: 'Staff operations',
    path: '/login?redirect=/dashboard',
    desc: 'Full sidebar: events, inventory, volunteers, communications, and all modules your role allows.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <section className="relative min-h-[88vh] overflow-hidden bg-black">
        {/* Base + RMI mark: logo must sit above flat black but below soft vignettes so it actually shows on the public hero */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[length:min(125vw,960px)] bg-[position:50%_6%] bg-no-repeat opacity-[0.32] sm:bg-[length:min(108vw,900px)] sm:opacity-[0.38]"
          style={{ backgroundImage: `url(${RMI_HERO_LOGO_URL})` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/82 via-black/45 to-black/88"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/50 via-transparent to-black/50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_70%_58%_at_50%_26%,rgba(0,0,0,0.42)_0%,transparent_65%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.42em] text-[#c9a227] sm:text-[0.7rem]">
            Roadmap Ministry International
          </p>

          <div className="mx-auto mt-10 w-full max-w-3xl text-center">
            <h1 className="text-balance">
              <span className="block text-[clamp(1.65rem,4.2vw,2.75rem)] font-light leading-[1.15] tracking-tight text-[#f5e6b8]">
                Data{' '}
                <span className="font-normal text-[#f4e4a8]">Management</span>
              </span>
              <span className="mt-1 block bg-gradient-to-r from-[#f4e4a8] via-[#e8c547] to-[#c9a227] bg-clip-text text-[clamp(2rem,5.5vw,3.65rem)] font-semibold leading-[1.1] tracking-tight text-transparent">
                System
              </span>
            </h1>
            <div className="mt-7 flex items-center justify-center gap-3 sm:mt-8">
              <span
                className="h-px w-14 max-w-[18vw] shrink-0 bg-gradient-to-r from-transparent to-[#c9a227]"
                aria-hidden
              />
              <span className="rounded-md border border-[#c9a227]/55 bg-[#c9a227]/10 px-4 py-2 text-xs font-bold tracking-[0.32em] text-[#e8c547] shadow-[0_0_24px_-4px_rgba(201,162,39,0.35)] sm:text-sm">
                DMS
              </span>
              <span
                className="h-px w-14 max-w-[18vw] shrink-0 bg-gradient-to-l from-transparent to-[#c9a227]"
                aria-hidden
              />
            </div>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-sm leading-relaxed text-[#f4e4a8]/[0.88] sm:text-base">
              The official operations platform for ministry leadership—secure role-based portals, financial discipline,
              and real-time insight across every department.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3 sm:mt-14">
            <Link
              to="/login?redirect=/admin"
              className="rounded-lg bg-gradient-to-r from-[#e8c547] to-[#c9a227] px-7 py-3 text-sm font-semibold text-black shadow-lg shadow-[rgba(201,162,39,0.25)] transition hover:from-[#f4e4a8] hover:to-[#e8c547]"
            >
              Admin sign-in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-[#c9a227]/55 px-7 py-3 text-sm font-medium text-[#f5e6b8] transition hover:border-[#e8c547] hover:bg-[#c9a227]/10"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-zinc-700/90 px-7 py-3 text-sm font-medium text-[#f4e4a8]/80 transition hover:border-[#c9a227]/50 hover:text-[#f5e6b8]"
            >
              General sign-in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#c9a227]/15 bg-[#070707] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#e8c547]">
            Ministry portals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#f4e4a8]/70">
            Choose a portal to sign in. Role-based entries (admin, finance, pastor, etc.) open your home dashboard.
            Module-focused cards use the staff console—after sign-in, open the matching item in the sidebar (your account
            must have access).
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTALS.map((p) => (
              <Link
                key={p.id}
                to={p.path}
                className={`group flex flex-col rounded-2xl border p-5 transition ${
                  p.highlight
                    ? 'border-[#c9a227]/55 bg-gradient-to-br from-[#c9a227]/18 to-zinc-950/90 shadow-lg shadow-[0_0_40px_-12px_rgba(201,162,39,0.45)]'
                    : 'border-zinc-800/90 bg-zinc-950/50 hover:border-[#c9a227]/40'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Portal</span>
                <span className="mt-1 text-lg font-semibold text-[#f5e6b8] group-hover:text-[#f4e4a8]">{p.label}</span>
                <span className="mt-2 text-sm leading-snug text-[#f4e4a8]/65">{p.desc}</span>
                <span className="mt-4 text-sm font-medium text-[#e8c547]">Sign in →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#e8c547]">
            Platform capabilities
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-5 transition hover:border-[#c9a227]/35"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {m.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#f5e6b8]">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#f4e4a8]/65">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-4 py-8 text-center text-xs text-[#f4e4a8]/45 sm:px-6">
        <span className="text-[#c9a227]/80">Roadmap Ministry International</span>
        <span className="text-[#f4e4a8]/50"> · </span>
        <span className="text-[#f5e6b8]/70">Data Management System</span>
        <span className="text-[#e8c547]/80"> DMS</span>
      </footer>
    </div>
  );
};

export default LandingPage;
