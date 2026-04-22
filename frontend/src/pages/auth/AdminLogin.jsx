import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import graphuraIcon from '../../assets/logos/graphura-main-logo.jpeg';
import { requireGeolocation } from '../../utils/requireGeolocation';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { latitude, longitude } = await requireGeolocation();
      const res = await api.post('/admin/login', { email, password, latitude, longitude });
      login(res.data.user, res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Verification failed. Invalid administrative credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'Organization-wide dashboards & reports',
    'Managers, attendance & employee records',
    'Secure, role-based administrator access',
  ];

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
          {/* Brand panel — desktop */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white min-h-[520px]">
            <div
              className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
              aria-hidden
            />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Graphura Admin
              </div>
              <div className="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-lg backdrop-blur-sm">
                <Shield className="w-7 h-7 text-indigo-200" strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 text-3xl xl:text-[2rem] font-bold tracking-tight leading-tight">
                Administrator console
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100/85 max-w-sm">
                Sign in to manage departments, teams, attendance, and reporting
                across your organization.
              </p>
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
            </div>

            <Link
              to="/"
              className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-white transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to website
            </Link>
          </div>

          {/* Form panel */}
          <div className="p-8 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white/80 backdrop-blur-md">
            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>

            <div className="text-center lg:text-left">
              <div className="inline-flex h-20 w-20 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-4 ring-white mb-5 mx-auto lg:mx-0">
                <img
                  src={graphuraIcon}
                  alt="Graphura"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 mb-2">
                Secure sign-in
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Admin login
              </h1>
              <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto lg:mx-0">
                Use the email and password for your administrator account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-left animate-shake"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-800 leading-snug">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
                >
                  Work email
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Remember this device
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors sm:text-right"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/35 active:scale-[0.99] disabled:opacity-55 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5 opacity-90" strokeWidth={2} />
                    Sign in to dashboard
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-200/80">
              <p className="text-center text-sm text-slate-500">
                Need an administrator account?{' '}
                <Link
                  to="/admin-register"
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Register with secret key
                </Link>
              </p>
              <p className="mt-4 text-center text-sm text-slate-500">
                Department lead?{' '}
                <Link
                  to="/manager-login"
                  className="font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Manager portal
                </Link>
              </p>
            </div>

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
};

export default AdminLogin;
