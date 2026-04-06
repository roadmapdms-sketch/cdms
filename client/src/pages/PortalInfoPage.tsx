import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { RMI_HERO_LOGO_URL } from '../constants/branding';
import { getPortalDetail } from '../constants/portalDetails';

const PortalInfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const detail = getPortalDetail(slug);

  if (!detail) {
    return <Navigate to="/" replace />;
  }

  const loginTo = `/login?redirect=${encodeURIComponent(detail.loginRedirect)}`;
  const registerTo = `/register?redirect=${encodeURIComponent(detail.loginRedirect)}`;

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="relative overflow-hidden border-b border-[#c9a227]/20 bg-black">
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[length:min(100vw,720px)] bg-[position:50%_0%] bg-no-repeat opacity-[0.22] sm:opacity-[0.28]"
          style={{ backgroundImage: `url(${RMI_HERO_LOGO_URL})` }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/85 via-black/55 to-black" />
        <header className="relative z-10 mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-left transition hover:opacity-90">
            <img
              src={RMI_HERO_LOGO_URL}
              alt="Roadmap Ministry International"
              className="h-12 w-auto object-contain sm:h-14"
            />
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#c9a227]/80">RMI · DMS</p>
              <p className="text-sm font-medium text-[#f5e6b8]">Back to home</p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              to={registerTo}
              className="rounded-lg border border-[#c9a227]/50 px-4 py-2 text-sm font-medium text-[#f5e6b8] transition hover:bg-[#c9a227]/10"
            >
              Create account
            </Link>
            <Link
              to={loginTo}
              className="rounded-lg bg-gradient-to-r from-[#e8c547] to-[#c9a227] px-5 py-2 text-sm font-semibold text-black shadow-md shadow-amber-900/25 transition hover:from-[#f4e4a8] hover:to-[#e8c547]"
            >
              Sign in
            </Link>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#c9a227]">Ministry portal</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {detail.icon}
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-[#f5e6b8] sm:text-4xl">
            {detail.label}
          </h1>
        </div>
        <p className="mt-4 text-xl font-medium text-[#e8c547]/95 sm:text-2xl">{detail.headline}</p>
        <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-[#f4e4a8]/85">{detail.summary}</p>

        <div className="mt-10 rounded-2xl border border-[#c9a227]/25 bg-zinc-950/80 p-6 shadow-lg shadow-black/40 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a227]/90">What you can do here</h2>
          <ul className="mt-5 space-y-4">
            {detail.highlights.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-[#f4e4a8]/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c547]" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Access & registration</h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">{detail.accessNote}</p>
          <p className="mt-4 text-xs text-zinc-600">
            After an administrator assigns your role, use <strong className="text-zinc-500">Sign in</strong> with the same
            email. Self-service signup typically creates a general user until your role is updated.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            to={loginTo}
            className="inline-flex justify-center rounded-lg bg-gradient-to-r from-[#e8c547] to-[#c9a227] px-8 py-3.5 text-center text-sm font-semibold text-black shadow-lg shadow-[rgba(201,162,39,0.25)] transition hover:from-[#f4e4a8] hover:to-[#e8c547]"
          >
            Sign in to this portal
          </Link>
          <Link
            to={registerTo}
            className="inline-flex justify-center rounded-lg border border-[#c9a227]/55 px-8 py-3.5 text-center text-sm font-medium text-[#f5e6b8] transition hover:border-[#e8c547] hover:bg-[#c9a227]/10"
          >
            Create an account
          </Link>
          <Link
            to="/"
            className="inline-flex justify-center rounded-lg border border-zinc-700 px-8 py-3.5 text-center text-sm font-medium text-zinc-400 transition hover:border-[#c9a227]/40 hover:text-[#f5e6b8]"
          >
            Return to marketing home
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-900 px-4 py-8 text-center text-xs text-[#f4e4a8]/40">
        Roadmap Ministry International · Data Management System (DMS)
      </footer>
    </div>
  );
};

export default PortalInfoPage;
