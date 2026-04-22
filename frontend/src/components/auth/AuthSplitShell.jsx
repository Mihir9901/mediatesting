import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import graphuraIcon from '../../assets/logos/graphura-main-logo.jpeg';

/**
 * Shared split layout: gradient story panel + form panel (matches Admin login).
 */
export default function AuthSplitShell({
  leftBadge = 'Graphura',
  leftIcon: LeftIcon,
  leftTitle,
  leftDescription,
  highlights = [],
  rightEyebrow,
  rightTitle,
  rightSubtitle,
  /** When set, replaces the default logo + headline block */
  rightHeader = null,
  children,
  footer = null,
  minHeightClass = 'min-h-[520px]',
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      <div className="fixed inset-0 -z-10 bg-[#FAFBFF]" aria-hidden />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[65%] h-[65%] rounded-full bg-indigo-200/50 blur-[100px] animate-mesh-flow" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full bg-violet-200/45 blur-[100px] animate-mesh-flow-delayed" />
        <div className="absolute inset-0 opacity-[0.035] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="w-full max-w-5xl">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border border-slate-200/80 bg-white/60 backdrop-blur-xl shadow-[0_32px_64px_-24px_rgba(15,23,42,0.18)] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div
            className={`relative hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white ${minHeightClass}`}
          >
            <div
              className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
              aria-hidden
            />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {leftBadge}
              </div>
              {LeftIcon && (
                <div className="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-lg backdrop-blur-sm">
                  <LeftIcon className="w-7 h-7 text-indigo-200" strokeWidth={1.5} />
                </div>
              )}
              <h2 className="mt-6 text-3xl xl:text-[2rem] font-bold tracking-tight leading-tight">
                {leftTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100/85 max-w-sm">
                {leftDescription}
              </p>
              {highlights.length > 0 && (
                <ul className="mt-10 space-y-3.5">
                  {highlights.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-3 text-sm text-indigo-50/90"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-emerald-400/90 shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              to="/"
              className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-white transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to website
            </Link>
          </div>

          <div className="p-8 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white/80 backdrop-blur-md">
            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>

            {rightHeader ? (
              <div className="mb-2">{rightHeader}</div>
            ) : (
              <div className="text-center lg:text-left">
                <div className="inline-flex h-20 w-20 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-4 ring-white mb-5 mx-auto lg:mx-0">
                  <img
                    src={graphuraIcon}
                    alt="Graphura"
                    className="h-full w-full object-cover"
                  />
                </div>
                {rightEyebrow ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 mb-2">
                    {rightEyebrow}
                  </p>
                ) : null}
                {rightTitle ? (
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {rightTitle}
                  </h1>
                ) : null}
                {rightSubtitle ? (
                  <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto lg:mx-0">
                    {rightSubtitle}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mt-8 lg:mt-10">{children}</div>

            {footer}

            <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              &copy; 2025 Graphura India Private Limited
            </p>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes mesh-flow { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8%, 8%) scale(1.05); } }
        @keyframes mesh-flow-delayed { 0%, 100% { transform: translate(0,0) scale(1.05); } 50% { transform: translate(-8%, -6%) scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-mesh-flow { animation: mesh-flow 18s ease-in-out infinite; }
        .animate-mesh-flow-delayed { animation: mesh-flow-delayed 22s ease-in-out infinite; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `,
        }}
      />
    </div>
  );
}
