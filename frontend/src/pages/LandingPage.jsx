import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import graphuraLogoIcon from '../assets/logos/graphura-main-logo.jpeg';
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Fingerprint,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const featuresRef = useRef(null);
  const platformRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [platformVisible, setPlatformVisible] = useState(false);

  useEffect(() => {
    setHeroIn(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const opts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target === featuresRef.current) setFeaturesVisible(true);
        if (e.target === platformRef.current) setPlatformVisible(true);
      });
    }, opts);
    if (featuresRef.current) obs.observe(featuresRef.current);
    if (platformRef.current) obs.observe(platformRef.current);
    return () => obs.disconnect();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Departments & managers',
      body: 'Structure teams clearly and give managers the right scope for their people.',
    },
    {
      icon: Clock,
      title: 'Attendance workflows',
      body: 'Mark and review attendance with a flow built for real teams—not spreadsheets alone.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Imports & records',
      body: 'Bring employee data in cleanly and keep rosters aligned as you grow.',
    },
    {
      icon: BarChart3,
      title: 'Reports leadership needs',
      body: 'Summaries and exports that help admins and managers decide faster.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-based access',
      body: 'Separate admin and manager experiences so permissions stay intentional.',
    },
    {
      icon: LayoutDashboard,
      title: 'One operational view',
      body: 'A single place to coordinate HR ops instead of scattered tools.',
    },
  ];

  const stats = [
    { label: 'For interns', value: 'Attendance self-check' },
    { label: 'What you need', value: 'Email + Intern ID' },
    { label: 'View', value: 'Month-wise history' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030108] font-sans text-slate-100 selection:bg-fuchsia-500/40 selection:text-white">
      {/* Animated background stack (replaces flat black) */}
      <div className="fixed inset-0 -z-10 animate-mesh-bg" aria-hidden />
      <div className="fixed inset-0 -z-10 animate-aurora-drift" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-[20%] top-[-15%] h-[55%] w-[55%] rounded-full bg-violet-500/30 blur-[120px] animate-blob" />
        <div className="animation-delay-2000 absolute -right-[15%] top-[20%] h-[45%] w-[45%] rounded-full bg-indigo-500/35 blur-[100px] animate-blob" />
        <div className="animation-delay-4000 absolute bottom-[-10%] left-[25%] h-[40%] w-[50%] rounded-full bg-fuchsia-500/25 blur-[110px] animate-blob" />
        <div className="absolute right-[10%] top-[40%] h-[30%] w-[30%] rounded-full bg-cyan-400/20 blur-[90px] animate-float-slow" />
        <div className="absolute left-1/2 top-[55%] h-[35%] w-[min(42rem,85%)] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px] animate-pulse-glow" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-grid-pan opacity-[0.4]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06]" />

      {/* Nav */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 px-4 transition-[padding] duration-500 ${
          scrolled ? 'py-2' : 'py-3 md:py-4'
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-500 md:px-6 ${
            scrolled
              ? 'border-white/10 bg-[#0c0820]/85 shadow-[0_12px_48px_-8px_rgba(99,102,241,0.25)] backdrop-blur-xl'
              : 'border-white/5 bg-white/[0.04] backdrop-blur-md'
          }`}
        >
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 overflow-hidden shadow-lg shadow-violet-500/20">
              <img
                src={graphuraLogoIcon}
                alt="Graphura logo"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Graphura
              <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                .
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-slate-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Product
            </a>
            <a href="#platform" className="transition-colors hover:text-white">
              Platform
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/intern-attendance"
                className="rounded-xl px-3 py-2 text-[13px] font-bold text-slate-400 transition-colors hover:text-white"
              >
                Interns
              </Link>
              <Link
                to="/manager-login"
                className="rounded-xl px-3 py-2 text-[13px] font-bold text-slate-400 transition-colors hover:text-white"
              >
                Manager
              </Link>
              <Link
                to="/admin-login"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-600/35 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              Admin sign in
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label={mobileNav ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileNav && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-[#0c0820]/95 p-4 shadow-2xl shadow-violet-900/20 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
                onClick={() => setMobileNav(false)}
              >
                Product
              </a>
              <a
                href="#platform"
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
                onClick={() => setMobileNav(false)}
              >
                Platform
              </a>
              <hr className="my-2 border-white/10" />
              <Link
                to="/intern-attendance"
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
                onClick={() => setMobileNav(false)}
              >
                Intern attendance
              </Link>
              <Link
                to="/team-head-login"
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
                onClick={() => setMobileNav(false)}
              >
                Team head login
              </Link>
              <Link
                to="/manager-login"
                className="rounded-xl px-3 py-3 text-sm font-bold text-white"
                onClick={() => setMobileNav(false)}
              >
                Manager login
              </Link>
              <Link
                to="/admin-login"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-3 text-center text-sm font-bold text-white"
                onClick={() => setMobileNav(false)}
              >
                Admin sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative px-4 pb-12 pt-20 sm:px-6 sm:pb-14 sm:pt-24 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200/90 shadow-[0_0_24px_-4px_rgba(217,70,239,0.35)] backdrop-blur-sm transition-all duration-700 ${
              heroIn ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
            Workforce operations, unified
          </div>

          <h1
            className={`text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.08] transition-all duration-700 delay-75 ${
              heroIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Check your attendance{' '}
            <span className="animate-gradient-x bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-[length:200%_auto] bg-clip-text text-transparent">
              in seconds.
            </span>
          </h1>

          <p
            className={`mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg transition-all duration-700 delay-150 ${
              heroIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Interns can view month-wise attendance using their registered email and intern ID.
            Managers and admins still have dedicated dashboards for team operations.
          </p>

          <div
            className={`mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center transition-all duration-700 delay-200 ${
              heroIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <Link
              to="/intern-attendance"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/25 transition-all active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 transition-all duration-500 group-hover:brightness-110" />
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              <span className="relative">Check attendance</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
            <Link
              to="/team-head-login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white shadow-inner backdrop-blur-sm transition-all hover:border-fuchsia-400/40 hover:bg-white/10"
            >
              Team head login
            </Link>
          </div>

          <div
            className={`mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 transition-all duration-700 delay-300 ${
              heroIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{ animationDelay: `${400 + i * 100}ms` }}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-4 py-4 text-center shadow-lg shadow-indigo-950/50 backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:shadow-fuchsia-900/20 ${
                  heroIn ? 'animate-stat-pop' : 'opacity-0'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
                <p className="mt-1 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-sm font-bold text-transparent">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        ref={featuresRef}
        className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-fuchsia-400/90">
              Product
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to coordinate your workforce
            </h2>
            <p className="mt-3 text-slate-400">
              Built for operational clarity—so admins steer the system and managers run the day.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  style={{ transitionDelay: featuresVisible ? `${i * 70}ms` : '0ms' }}
                  className={`group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-700 hover:border-violet-400/35 hover:shadow-violet-900/25 ${
                    featuresVisible
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-600/30 text-fuchsia-200 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:from-violet-500/50 group-hover:to-fuchsia-600/40 group-hover:shadow-lg group-hover:shadow-fuchsia-500/20">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section
        id="platform"
        ref={platformRef}
        className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-fuchsia-400/90">
                Platform
              </p>
              <h2
                className={`mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl transition-all duration-700 ${
                  platformVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
              >
                Infrastructure that matches how teams actually work
              </h2>
            </div>
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-2 text-sm font-bold text-fuchsia-300 transition-colors hover:text-fuchsia-200"
            >
              Explore the admin console
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={`grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-3 md:grid-cols-12 md:gap-4 transition-all duration-700 ${
              platformVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-violet-950/50 to-indigo-950/30 p-6 shadow-xl shadow-violet-950/40 backdrop-blur-md transition duration-500 hover:border-violet-400/30 md:col-span-7 md:row-span-2 md:min-h-[320px]">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-indigo-600/40 text-white">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold text-white">Trusted access</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  Separate admin and manager journeys with clear permissions—so the right people
                  see the right records.
                </p>
              </div>
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="animate-shimmer-bar h-full w-2/3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 p-6 text-white shadow-2xl shadow-fuchsia-900/40 md:col-span-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Operational speed</h3>
                <p className="mt-2 text-sm font-medium text-white/85">
                  Fewer handoffs between tools. Faster visibility into attendance and team status.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-[#0a0612] p-6 text-white shadow-xl md:col-span-5">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-fuchsia-500/60" />
                ))}
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold leading-snug">
                    Reporting
                    <br />
                    that compounds
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">Trends and exports for leadership.</p>
                </div>
                <TrendingUp className="h-10 w-10 shrink-0 text-fuchsia-400" strokeWidth={1.5} />
              </div>
            </div>

            <div className="relative flex min-h-[160px] items-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-indigo-950/40 to-violet-950/30 p-6 shadow-xl backdrop-blur-sm md:col-span-7">
              <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-bold text-white">Security-minded by default</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Protect sensitive people data with sensible access boundaries—designed for real
                  organizational responsibility.
                </p>
              </div>
              <ShieldCheck
                className="absolute -right-4 top-1/2 h-32 w-32 -translate-y-1/2 text-violet-500/15 md:right-8 md:h-40 md:w-40"
                strokeWidth={1}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-10 sm:px-6 sm:py-12">
        <div className="animate-cta-glow relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-fuchsia-500/20 bg-gradient-to-br from-violet-950 via-[#1a0a2e] to-indigo-950 px-6 py-10 text-center shadow-2xl shadow-violet-900/50 sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12]" />
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-fuchsia-600/30 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-indigo-600/30 blur-[80px]" />
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
            Intern? View your attendance now.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-violet-200/80 sm:text-base">
            Use your registered email and intern ID to open your month-wise attendance details.
          </p>
          <div className="relative mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/intern-attendance"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-violet-950 shadow-lg transition hover:bg-fuchsia-100"
            >
              Check attendance
            </Link>
            <Link
              to="/manager-login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:border-fuchsia-300/50 hover:bg-white/10"
            >
              Manager login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050308]/90 px-4 py-10 backdrop-blur-md sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 md:gap-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 overflow-hidden">
                  <img
                    src={graphuraLogoIcon}
                    alt="Graphura logo"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="text-lg font-bold tracking-tight text-white">
                  Graphura<span className="text-fuchsia-400">.</span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Workforce operations for teams that need clarity—not chaos.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Product</p>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-400">
                <li>
                  <a href="#features" className="transition-colors hover:text-fuchsia-300">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#platform" className="transition-colors hover:text-fuchsia-300">
                    Platform
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Access</p>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-400">
                <li>
                  <Link to="/admin-login" className="transition-colors hover:text-fuchsia-300">
                    Admin login
                  </Link>
                </li>
                <li>
                  <Link to="/manager-login" className="transition-colors hover:text-fuchsia-300">
                    Manager login
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="transition-colors hover:text-fuchsia-300">
                    Forgot password
                  </Link>
                </li>
                <li>
                  <Link to="/intern-attendance" className="transition-colors hover:text-fuchsia-300">
                    Intern attendance
                  </Link>
                </li>
                <li>
                  <Link to="/team-head-login" className="transition-colors hover:text-fuchsia-300">
                    Team head login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal</p>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-400">
                <li>
                  <a href="#" className="transition-colors hover:text-fuchsia-300">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-fuchsia-300">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-[13px] font-semibold text-slate-500 sm:flex-row">
            <p>© 2025 Graphura India Private Limited</p>
            <p>Built for operational teams</p>
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(28px, -32px) scale(1.05); }
          66% { transform: translate(-22px, 18px) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(12px, -20px); }
        }
        @keyframes mesh-bg {
          0% { background-position: 0% 40%; }
          25% { background-position: 100% 60%; }
          50% { background-position: 80% 0%; }
          75% { background-position: 20% 80%; }
          100% { background-position: 0% 40%; }
        }
        .animate-mesh-bg {
          background: linear-gradient(
            125deg,
            #030108 0%,
            #0c0518 18%,
            #1a0a2e 32%,
            #0f172a 48%,
            #1e1b4b 62%,
            #134e4a 78%,
            #0c0518 92%,
            #030108 100%
          );
          background-size: 400% 400%;
          animation: mesh-bg 22s ease-in-out infinite;
        }
        @keyframes aurora-drift {
          0%, 100% {
            opacity: 0.75;
            transform: translate(0, 0) scale(1);
            filter: hue-rotate(0deg);
          }
          33% {
            opacity: 0.95;
            transform: translate(3%, -2%) scale(1.03);
            filter: hue-rotate(12deg);
          }
          66% {
            opacity: 0.8;
            transform: translate(-2%, 3%) scale(0.99);
            filter: hue-rotate(-8deg);
          }
        }
        .animate-aurora-drift {
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(139, 92, 246, 0.45), transparent 55%),
            radial-gradient(ellipse 55% 45% at 95% 45%, rgba(217, 70, 239, 0.2), transparent 50%),
            radial-gradient(ellipse 50% 40% at 5% 85%, rgba(34, 211, 238, 0.14), transparent 50%),
            radial-gradient(ellipse 40% 35% at 70% 90%, rgba(167, 139, 250, 0.12), transparent 45%);
          animation: aurora-drift 16s ease-in-out infinite;
        }
        @keyframes grid-pan {
          0% { opacity: 0.25; transform: translate(0, 0); }
          50% { opacity: 0.5; transform: translate(-12px, -8px); }
          100% { opacity: 0.25; transform: translate(0, 0); }
        }
        .animate-grid-pan {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 72px 72px;
          animation: grid-pan 14s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.28; }
          50% { opacity: 0.62; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 9s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes stat-pop {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer-bar {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
          100% { filter: brightness(1); }
        }
        @keyframes cta-glow {
          0%, 100% { box-shadow: 0 24px 80px -20px rgba(139, 92, 246, 0.35), 0 0 0 1px rgba(217, 70, 239, 0.15); }
          50% { box-shadow: 0 28px 100px -16px rgba(217, 70, 239, 0.45), 0 0 0 1px rgba(167, 139, 250, 0.25); }
        }
        .animate-blob { animation: blob 20s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: -7s; }
        .animation-delay-4000 { animation-delay: -14s; }
        .animate-float-slow { animation: float-slow 14s ease-in-out infinite; }
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
        .animate-stat-pop {
          animation: stat-pop 0.7s ease forwards;
          animation-fill-mode: both;
        }
        .animate-shimmer-bar {
          animation: shimmer-bar 3s ease-in-out infinite;
        }
        .animate-cta-glow {
          animation: cta-glow 5s ease-in-out infinite;
        }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
      `,
        }}
      />
    </div>
  );
};

export default LandingPage;
