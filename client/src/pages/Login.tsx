import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';
import { AUTH_API_BASE_URL } from '../config/api';
import { RMI_HERO_LOGO_URL } from '../constants/branding';
import { getSafeRedirectParam, canAccessPortalPath } from '../utils/allowedRedirects';

interface LoginFormData {
  email: string;
  password: string;
}

const REDIRECT_HINTS: Record<string, string> = {
  '/admin': 'Administrator portal',
  '/accountant': 'Finance & accounting',
  '/pastor': 'Pastoral leadership',
  '/volunteer': 'Volunteer coordination',
  '/user': 'Member portal',
  '/dashboard': 'Staff operations console',
  '/media': 'Media department',
  '/kitchen': 'Kitchen & restaurant',
  '/management': 'Management',
  '/ushers': 'Usher management',
  '/ministry-partners': 'Ministry partners',
  '/prayer-line-portal': 'Prayer line',
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget = useMemo(
    () => getSafeRedirectParam(searchParams.get('redirect')),
    [searchParams]
  );

  const portalHint = redirectTarget ? REDIRECT_HINTS[redirectTarget] : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goAfterLogin = (role: string) => {
    if (redirectTarget && canAccessPortalPath(redirectTarget, role)) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    switch (role) {
      case 'ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'ACCOUNTANT':
        navigate('/accountant', { replace: true });
        break;
      case 'PASTOR':
        navigate('/pastor', { replace: true });
        break;
      case 'VOLUNTEER_COORDINATOR':
        navigate('/volunteer', { replace: true });
        break;
      case 'MEDIA_DEPARTMENT':
        navigate('/media', { replace: true });
        break;
      case 'KITCHEN_RESTAURANT':
        navigate('/kitchen', { replace: true });
        break;
      case 'MANAGEMENT':
        navigate('/management', { replace: true });
        break;
      case 'USHER_MANAGEMENT':
        navigate('/ushers', { replace: true });
        break;
      case 'PARTNERS_COORDINATOR':
        navigate('/ministry-partners', { replace: true });
        break;
      case 'PRAYER_LINE_COORDINATOR':
        navigate('/prayer-line-portal', { replace: true });
        break;
      case 'MEMBER':
        navigate('/user', { replace: true });
        break;
      case 'VOLUNTEER':
      case 'STAFF':
      case 'USER':
      default:
        navigate('/dashboard', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const userRole = response.data.user.role as string;
      goAfterLogin(userRole);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (isAxiosError(err) && !err.response) {
        setError(
          'Cannot reach the sign-in service. Check REACT_APP_AUTH_API_URL or your API host, then redeploy.'
        );
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[length:min(100vw,640px)] bg-[position:50%_-5%] bg-no-repeat opacity-[0.12]"
        style={{ backgroundImage: `url(${RMI_HERO_LOGO_URL})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#070707]/95 to-[#070707]" />

      <div className="relative z-10 mx-auto w-full max-w-md space-y-8">
        <div>
          <Link
            to="/"
            className="mx-auto flex justify-center text-xs uppercase tracking-[0.2em] text-[#c9a227]/80 hover:text-[#e8c547]"
          >
            ← Roadmap Ministry · DMS
          </Link>
          <h2 className="mt-6 text-center text-3xl font-semibold text-[#f5e6b8]">Sign in</h2>
          <p className="mt-2 text-center text-sm text-zinc-500">Data Management System</p>
          {portalHint ? (
            <p className="mt-3 rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 px-3 py-2 text-center text-sm text-[#e8c547]">
              {portalHint}
              <span className="mt-1 block text-xs font-normal text-zinc-400">
                If your role does not match this portal, you will be routed to the correct dashboard after sign-in.
              </span>
            </p>
          ) : null}
        </div>

        <form
          className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-md"
          onSubmit={handleSubmit}
        >
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-t-md border border-zinc-700 bg-black/40 px-3 py-2 text-[#f5e6b8] placeholder-zinc-600 focus:z-10 focus:border-[#c9a227] focus:outline-none focus:ring-[#c9a227] sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-b-md border border-t-0 border-zinc-700 bg-black/40 px-3 py-2 text-[#f5e6b8] placeholder-zinc-600 focus:z-10 focus:border-[#c9a227] focus:outline-none focus:ring-[#c9a227] sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full justify-center rounded-lg bg-gradient-to-r from-[#e8c547] to-[#c9a227] py-2.5 text-sm font-semibold text-black shadow-lg shadow-[rgba(201,162,39,0.25)] hover:from-[#f4e4a8] hover:to-[#e8c547] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="relative text-center">
            <span className="relative z-10 bg-zinc-950 px-2 text-xs text-zinc-600">or</span>
            <div className="absolute inset-0 top-1/2 z-0 border-t border-zinc-800" />
          </div>

          <p className="text-center text-sm text-zinc-500">
            <Link to="/register" className="font-medium text-[#c9a227] hover:text-[#e8c547]">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
