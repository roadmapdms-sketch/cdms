import React, { useState, useMemo, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AUTH_API_BASE_URL } from '../config/api';
import { REGISTRATION_ACCOUNT_TYPES } from '../constants/signInDestinations';
import { getSafeRedirectParam } from '../utils/allowedRedirects';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectAfterLogin = useMemo(
    () => getSafeRedirectParam(searchParams.get('redirect')),
    [searchParams]
  );

  const suggestedAccountType = useMemo<'MEMBER' | 'USER'>(() => {
    if (redirectAfterLogin === '/user') return 'MEMBER';
    return 'USER';
  }, [redirectAfterLogin]);

  const [accountType, setAccountType] = useState<'MEMBER' | 'USER'>(suggestedAccountType);

  useEffect(() => {
    setAccountType(suggestedAccountType);
  }, [suggestedAccountType]);

  const loginHref = useMemo(() => {
    const dest = redirectAfterLogin ?? '/user';
    return `/login?redirect=${encodeURIComponent(dest)}`;
  }, [redirectAfterLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${AUTH_API_BASE_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: accountType,
      });

      setSuccess('Registration successful! Taking you to sign in…');
      setTimeout(() => {
        navigate(loginHref, { replace: true });
      }, 1800);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const apiMsg = err.response?.data?.error?.message;
        if (apiMsg) {
          setError(apiMsg);
        } else if (err.response) {
          setError(`Registration failed (${err.response.status}).`);
        } else {
          const dev = process.env.NODE_ENV === 'development';
          setError(
            dev
              ? `Cannot reach API at ${AUTH_API_BASE_URL}. Start the server (e.g. npm run dev in server/) and check CORS / port. (${err.message})`
              : 'Cannot reach the sign-up service. If REACT_APP_API_URL points to an API host that is down, set REACT_APP_AUTH_API_URL to your main Vercel URL with /api (see api/README.md), redeploy, and try again.'
          );
        }
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register for Data Management System (DMS)
            {redirectAfterLogin ? (
              <span className="mt-2 block text-xs text-gray-500">
                After registering you&apos;ll be sent to sign in with the same destination when your role allows it.
              </span>
            ) : null}
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900">Registering as</legend>
              <p className="mt-1 text-xs text-gray-500">
                Self-service signup can only create <strong className="text-gray-700">member</strong> or{' '}
                <strong className="text-gray-700">general staff (USER)</strong> accounts. Coordinator roles (pastor,
                finance, media, etc.) are assigned by an administrator after you have an account.
              </p>
              <div className="mt-3 space-y-3">
                {REGISTRATION_ACCOUNT_TYPES.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer rounded-lg border p-3 transition ${
                      accountType === opt.value
                        ? 'border-blue-500 bg-blue-50/80 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={opt.value}
                      checked={accountType === opt.value}
                      onChange={() => setAccountType(opt.value)}
                      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">{opt.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {accountType === 'MEMBER' && redirectAfterLogin && redirectAfterLogin !== '/user' ? (
                <p className="mt-2 text-xs text-amber-800">
                  You chose a member account but the link targets another portal. After login, members always open the
                  member portal until an admin changes your role.
                </p>
              ) : null}
              {accountType === 'USER' && redirectAfterLogin === '/user' ? (
                <p className="mt-2 text-xs text-amber-800">
                  USER accounts also land on the member portal by default until an admin upgrades your role.
                </p>
              ) : null}
            </fieldset>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            ) : null}

            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Registering…' : 'Create account'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to={loginHref} className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in to your existing account
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
