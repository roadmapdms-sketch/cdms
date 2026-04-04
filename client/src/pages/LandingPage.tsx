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
    title: 'Budget Planning',
    desc: 'Department budgeting and financial forecasting',
    icon: '📈',
  },
  {
    title: 'Reporting Dashboard',
    desc: 'Real-time analytics and custom reports',
    icon: '📊',
  },
  {
    title: 'Security System',
    desc: 'Role-based access control and data protection',
    icon: '🔐',
  },
] as const;

const PORTALS: Array<{
  label: string;
  path: string;
  desc: string;
  highlight?: boolean;
}> = [
  {
    label: 'Administrator',
    path: '/login?redirect=/admin',
    desc: 'Full system oversight, users, and all modules',
    highlight: true,
  },
  {
    label: 'Finance & accounting',
    path: '/login?redirect=/accountant',
    desc: 'Budget, expenses, vendors, and giving',
  },
  {
    label: 'Pastoral leadership',
    path: '/login?redirect=/pastor',
    desc: 'Care, prayer, and member engagement',
  },
  {
    label: 'Volunteer coordination',
    path: '/login?redirect=/volunteer',
    desc: 'Teams, rosters, and serving opportunities',
  },
  {
    label: 'Member portal',
    path: '/login?redirect=/user',
    desc: 'Personal schedule, giving, and updates',
  },
  {
    label: 'Staff operations',
    path: '/login?redirect=/dashboard',
    desc: 'Main console: events, communications, reports, and more',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <section className="relative min-h-[88vh] overflow-hidden">
        {/* Full-bleed watermark: wide logo reads best from the top */}
        <div
          className="absolute inset-0 bg-[length:min(120vw,920px)] bg-[position:50%_0%] bg-no-repeat opacity-[0.38] sm:bg-[length:min(100vw,820px)]"
          style={{ backgroundImage: `url(${RMI_HERO_LOGO_URL})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/88 to-[#070707]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-black opacity-90" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,transparent_0%,#000_75%)] opacity-95"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <p className="text-center text-[0.7rem] uppercase tracking-[0.35em] text-[#c9a227]/90 sm:text-xs">
            Roadmap Ministry International
          </p>
          <h1 className="mt-4 text-center text-4xl font-semibold leading-tight text-[#f5e6b8] sm:text-5xl md:text-6xl">
            Church Data
            <span className="block bg-gradient-to-r from-[#f4e4a8] via-[#e8c547] to-[#a68516] bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base text-zinc-400 sm:text-lg">
            One secure platform for ministry operations—from the sanctuary schedule to the balance sheet—with
            role-based portals for every leader and member.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/login?redirect=/admin"
              className="rounded-lg bg-gradient-to-r from-[#c9a227] to-[#8a6d1a] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-900/40 transition hover:from-[#e8c547] hover:to-[#c9a227]"
            >
              Admin sign-in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-[#c9a227]/50 px-6 py-3 text-sm font-medium text-[#f4e4a8] transition hover:bg-[#c9a227]/10"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#c9a227]/40 hover:text-[#c9a227]"
            >
              General sign-in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#c9a227]/15 bg-[#070707] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a227]/80">
            Ministry portals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-500">
            Choose your workspace. After you sign in, you are routed to the correct dashboard for your role. The
            administrator portal has visibility across every module.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTALS.map((p) => (
              <Link
                key={p.label}
                to={p.path}
                className={`group flex flex-col rounded-2xl border p-5 transition ${
                  p.highlight
                    ? 'border-[#c9a227]/50 bg-gradient-to-br from-[#c9a227]/15 to-zinc-900/80 shadow-lg shadow-amber-950/30'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-[#c9a227]/35'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Portal</span>
                <span className="mt-1 text-lg font-semibold text-[#f5e6b8] group-hover:text-white">{p.label}</span>
                <span className="mt-2 text-sm text-zinc-500">{p.desc}</span>
                <span className="mt-4 text-sm font-medium text-[#e8c547]">Sign in →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a227]/80">
            Platform capabilities
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-5 transition hover:border-[#c9a227]/25"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {m.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#f0e6c8]">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-4 py-8 text-center text-xs text-zinc-600 sm:px-6">
        Roadmap Ministry International · Church Data Management System
      </footer>
    </div>
  );
};

export default LandingPage;
