import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AuthSplitShell from '../../components/auth/AuthSplitShell';
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import graphuraIcon from '../../assets/logos/graphura-main-logo.jpeg';

const inputClass =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'Password reset links expire after a short time',
    'Use the email tied to your Graphura account',
    'You can request a new link if needed',
  ];

  const successHeader = (
    <div className="text-center lg:text-left">
      <div className="inline-flex h-20 w-20 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-4 ring-white mb-5 mx-auto lg:mx-0">
        <img
          src={graphuraIcon}
          alt="Graphura"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex justify-center lg:justify-start mb-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2
            className="w-9 h-9 text-emerald-600"
            strokeWidth={2}
          />
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 mb-2">
        Check your inbox
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        Reset link sent
      </h1>
      <p className="mt-3 text-slate-600 text-sm max-w-md mx-auto lg:mx-0 leading-relaxed">
        {message}
      </p>
    </div>
  );

  return (
    <AuthSplitShell
      leftBadge="Graphura Access"
      leftIcon={KeyRound}
      leftTitle="Forgot your password?"
      leftDescription="We’ll email you a secure link to choose a new password. It only works for a limited time."
      highlights={highlights}
      rightEyebrow={message ? undefined : 'Account recovery'}
      rightTitle={message ? undefined : 'Reset password'}
      rightSubtitle={
        message
          ? undefined
          : 'Enter the email you use to sign in. We’ll send reset instructions there.'
      }
      rightHeader={message ? successHeader : null}
    >
      {message ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <Link
            to="/admin-login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to admin login
          </Link>
          <Link
            to="/manager-login"
            className="text-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Manager login instead
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
              htmlFor="fp-email"
              className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              Account email
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputClass}
              />
            </div>
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
                <Mail className="w-5 h-5 opacity-90" />
                Send reset link
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 pt-2">
            Remember your password?{' '}
            <Link
              to="/admin-login"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Admin login
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              to="/manager-login"
              className="font-semibold text-slate-700 hover:text-indigo-600"
            >
              Manager login
            </Link>
          </p>
        </form>
      )}
    </AuthSplitShell>
  );
};

export default ForgotPassword;
