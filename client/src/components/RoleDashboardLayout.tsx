import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffAppShell, { StaffAppShellUser } from './StaffAppShell';
import { logout } from '../utils/authSession';
import { RMI_HERO_LOGO_URL } from '../constants/branding';
import { getDefaultHomePath, sidebarItemsForRole } from '../utils/roles';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#c9a227]/25 bg-zinc-900/75 p-5 shadow-lg shadow-black/50 backdrop-blur-sm">
      <div className="text-2xl font-semibold tabular-nums text-[#f4e4a8] sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      {hint ? <div className="mt-2 text-xs text-emerald-400/90">{hint}</div> : null}
    </div>
  );
}

export function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a227]/85">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function RoleDashboardLayout({
  title,
  roleBadge,
  /** When true (default), show the same full feature sidebar as the operations console. */
  showStaffSidebar = true,
  children,
}: {
  title: string;
  roleBadge: string;
  showStaffSidebar?: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<StaffAppShellUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (token && raw) {
      try {
        setUser(JSON.parse(raw));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        setUser(null);
      }
    }
  }, []);

  if (showStaffSidebar) {
    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#070707]">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
        </div>
      );
    }
    const navigation = sidebarItemsForRole(user.role);
    const roleHome = getDefaultHomePath(user.role);
    return (
      <StaffAppShell
        user={user}
        navigation={navigation}
        roleHome={roleHome}
        headerTitle={title}
        headerSubtitle={roleBadge}
        showApiHealthBanner
        mainInnerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {children}
      </StaffAppShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100">
      <header className="border-b border-[#c9a227]/25">
        <div className="relative overflow-hidden bg-black">
          <div
            className="pointer-events-none absolute inset-0 bg-[length:min(110vw,800px)] bg-[position:50%_0%] bg-no-repeat opacity-[0.2]"
            style={{ backgroundImage: `url(${RMI_HERO_LOGO_URL})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" aria-hidden />
          <div className="relative mx-auto flex max-w-7xl justify-center px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            <img
              src={RMI_HERO_LOGO_URL}
              alt="Roadmap Ministry International"
              className="h-[clamp(4.25rem,16vw,9.5rem)] w-auto max-w-[min(100%,34rem)] object-contain drop-shadow-[0_0_28px_rgba(201,162,39,0.22)]"
            />
          </div>
        </div>
        <div className="relative overflow-hidden border-t border-[#c9a227]/15 bg-gradient-to-r from-black via-[#14110a] to-black">
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#c9a227]/75 sm:text-xs">
                Roadmap Ministry International
              </p>
              <h1 className="text-xl font-semibold text-[#f5e6b8] sm:text-2xl">{title}</h1>
              <span className="mt-2 inline-block rounded-full border border-[#c9a227]/35 bg-black/50 px-3 py-0.5 text-xs text-[#e8c547]">
                {roleBadge}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-[#c9a227]"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => logout(navigate)}
                className="rounded-lg bg-gradient-to-r from-[#c9a227] to-[#a68516] px-4 py-2 text-sm font-semibold text-black shadow-md shadow-amber-900/30 hover:from-[#e8c547] hover:to-[#c9a227]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function RoleDashboardLoading({ showStaffSidebar = true }: { showStaffSidebar?: boolean }) {
  const [user, setUser] = useState<StaffAppShellUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  if (showStaffSidebar && user) {
    const navigation = sidebarItemsForRole(user.role);
    const roleHome = getDefaultHomePath(user.role);
    return (
      <StaffAppShell
        user={user}
        navigation={navigation}
        roleHome={roleHome}
        headerTitle="Loading…"
        showApiHealthBanner={false}
        mainInnerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
        </div>
      </StaffAppShell>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070707]">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#c9a227] border-t-transparent" />
    </div>
  );
}

export function QuickActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[#c9a227]/30 bg-zinc-900/80 px-3 py-3 text-left text-sm font-medium text-[#f0e6c8] shadow-md shadow-black/40 transition hover:border-[#c9a227]/60 hover:bg-[#c9a227]/10"
    >
      {children}
    </button>
  );
}

export function DataPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900/60 shadow-xl shadow-black/40">
      <div className="border-b border-zinc-700/80 bg-black/30 px-5 py-3">
        <h3 className="text-sm font-semibold text-[#e8c547]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
