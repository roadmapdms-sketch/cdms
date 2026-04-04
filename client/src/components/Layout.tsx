import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getMainApiHealthUrl } from '../config/api';
import { logout } from '../utils/authSession';
import { sidebarItemsForRole } from '../utils/roles';

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

  return (
    <div className="min-h-screen bg-[#eeedee]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} 
             onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4 bg-[#7a0f1a]">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">CDMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-[#e7b123]/20 text-[#7a0f1a]'
                    : 'text-gray-600 hover:bg-[#e7b123]/10 hover:text-[#7a0f1a]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-[#eeedee] pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-2xl font-bold text-[#7a0f1a]">CDMS</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-[#e7b123]/20 text-[#7a0f1a]'
                    : 'text-gray-600 hover:bg-[#e7b123]/10 hover:text-[#7a0f1a]'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-[#eeedee]">
          <button
            type="button"
            className="md:hidden px-4 text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1 flex justify-between items-center px-4 md:px-6">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#7a0f1a]">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <span className="text-sm text-[#7a0f1a]">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-[#7a0f1a] bg-[#eeedee] px-2 py-1 rounded">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-[#7a0f1a] hover:text-[#e7b123] font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {mainApiUnreachable === true && !bannerDismissed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-950">
            <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <strong>Staff data cannot load.</strong> Members, events, attendance, and other modules need the{' '}
                <strong>Express API</strong> (<code className="text-xs bg-amber-100 px-1 rounded">server/</code>) running
                at the host configured in <code className="text-xs bg-amber-100 px-1 rounded">REACT_APP_API_URL</code>{' '}
                (currently <code className="text-xs bg-amber-100 px-1 rounded break-all">{API_BASE_URL}</code>). Deploy
                that server (e.g. Railway, Render, Docker) or fix the URL, then redeploy the frontend. Login/register can
                still use <code className="text-xs bg-amber-100 px-1 rounded">REACT_APP_AUTH_API_URL</code> on the main
                Vercel app.
              </p>
              <button
                type="button"
                className="shrink-0 text-amber-900 underline font-medium"
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
