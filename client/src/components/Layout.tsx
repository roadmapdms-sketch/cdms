import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getMainApiHealthUrl } from '../config/api';
import { RMI_HERO_LOGO_URL } from '../constants/branding';
import { logout } from '../utils/authSession';
import { getDefaultHomePath, sidebarItemsForRole } from '../utils/roles';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const HIDE_API_BANNER_KEY = 'cdms-hide-main-api-banner';

const Layout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainApiUnreachable, setMainApiUnreachable] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(HIDE_API_BANNER_KEY) === '1'
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (bannerDismissed) return;
    const url = getMainApiHealthUrl();
    const ac = new AbortController();
    fetch(url, { method: 'GET', signal: ac.signal })
      .then((r) => setMainApiUnreachable(!r.ok))
      .catch(() => setMainApiUnreachable(true));
    return () => ac.abort();
  }, [bannerDismissed]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    logout(navigate);
  };

  if (!user) {
    return null; // Will redirect to login
  }

  const navigation = sidebarItemsForRole(user.role);

  const roleHome = getDefaultHomePath(user.role);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black transition-opacity ${sidebarOpen ? 'opacity-70' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 flex max-w-xs w-full flex-col border-r border-[#c9a227]/20 bg-[#080808] transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-auto min-h-16 flex-col justify-center gap-2 border-b border-[#c9a227]/20 bg-gradient-to-r from-black to-[#14110a] px-4 py-3">
            <img
              src={RMI_HERO_LOGO_URL}
              alt=""
              className="mx-auto h-10 w-auto max-w-[200px] object-contain opacity-90"
            />
            <div className="text-center">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#c9a227]/80">RMI</span>
              <span className="block text-lg font-semibold text-[#f5e6b8]">CDMS</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-[#c9a227] hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-2 py-2 text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-[#c9a227]/15 text-[#f4e4a8]'
                    : 'text-zinc-400 hover:bg-[#c9a227]/10 hover:text-[#f5e6b8]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <Link
                to={roleHome}
                className="block rounded-lg px-2 py-2 text-xs uppercase tracking-wider text-[#c9a227]/90 hover:bg-[#c9a227]/10"
                onClick={() => setSidebarOpen(false)}
              >
                ← Role portal home
              </Link>
              <Link
                to="/"
                className="mt-1 block rounded-lg px-2 py-2 text-xs text-zinc-500 hover:text-[#c9a227]"
                onClick={() => setSidebarOpen(false)}
              >
                Marketing site
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r border-[#c9a227]/20 bg-[#080808] pb-4 pt-5">
          <div className="flex-shrink-0 px-4">
            <img
              src={RMI_HERO_LOGO_URL}
              alt="Roadmap Ministry International"
              className="mx-auto h-14 w-auto max-w-[220px] object-contain drop-shadow-[0_0_12px_rgba(201,162,39,0.2)]"
            />
            <span className="mt-3 block text-center text-[0.65rem] uppercase tracking-[0.25em] text-[#c9a227]/80">
              Roadmap Ministry
            </span>
            <span className="mt-1 block text-center text-xl font-semibold text-[#f5e6b8]">CDMS</span>
            <p className="mt-1 text-center text-xs text-zinc-600">Operations console</p>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-2 py-2 text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-[#c9a227]/15 text-[#f4e4a8]'
                    : 'text-zinc-400 hover:bg-[#c9a227]/10 hover:text-[#f5e6b8]'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-zinc-800 px-4 pt-4">
            <Link
              to={roleHome}
              className="block rounded-lg py-2 text-xs font-medium uppercase tracking-wider text-[#c9a227] hover:text-[#e8c547]"
            >
              ← Role portal home
            </Link>
            <Link to="/" className="mt-1 block py-2 text-xs text-zinc-600 hover:text-[#c9a227]">
              Marketing site
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur">
          <button
            type="button"
            className="px-4 text-zinc-400 hover:text-[#c9a227] focus:outline-none md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex flex-1 items-center justify-between px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img
                src={RMI_HERO_LOGO_URL}
                alt=""
                className="hidden h-9 w-auto shrink-0 object-contain opacity-85 sm:block md:h-10"
              />
              <h1 className="truncate text-lg font-semibold text-[#f5e6b8]">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center space-x-3 md:ml-6 md:space-x-4">
              <span className="hidden text-sm text-zinc-400 sm:inline">
                {user.firstName} {user.lastName}
              </span>
              <span className="rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-2 py-1 text-xs text-[#e8c547]">
                {user.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-[#c9a227] hover:text-[#e8c547]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {mainApiUnreachable === true && !bannerDismissed && (
          <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <strong>Staff data cannot load.</strong> The app could not reach{' '}
                <code className="rounded bg-amber-900/50 px-1 text-xs break-all text-amber-200">{API_BASE_URL}</code>. On
                Vercel, unset <code className="rounded bg-amber-900/50 px-1 text-xs text-amber-200">REACT_APP_API_URL</code>{' '}
                for same-origin API, and set <code className="rounded bg-amber-900/50 px-1 text-xs text-amber-200">DATABASE_URL</code> /{' '}
                <code className="rounded bg-amber-900/50 px-1 text-xs text-amber-200">JWT_SECRET</code>. If the API is on
                another host, fix <code className="rounded bg-amber-900/50 px-1 text-xs text-amber-200">REACT_APP_API_URL</code> and redeploy.
              </p>
              <button
                type="button"
                className="shrink-0 font-medium text-amber-200 underline"
                onClick={() => {
                  localStorage.setItem(HIDE_API_BANNER_KEY, '1');
                  setBannerDismissed(true);
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
