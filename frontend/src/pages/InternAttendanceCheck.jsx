import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthSplitShell from '../components/auth/AuthSplitShell';
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  Mail,
  Hash,
} from 'lucide-react';

const statusStyle = (status) => {
  if (status === 'Present') return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
  if (status === 'Absent') return 'bg-rose-50 text-rose-800 ring-rose-200';
  if (status === 'Completed') return 'bg-indigo-50 text-indigo-800 ring-indigo-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200';
};

const InternAttendanceCheck = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [internId, setInternId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/attendance/intern-lookup', {
        email: email.trim(),
        intern_id: internId.trim(),
      });
      // If lookup succeeds, open the full details page directly
      navigate(
        `/intern-attendance/details?email=${encodeURIComponent(
          email.trim()
        )}&intern_id=${encodeURIComponent(internId.trim())}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load attendance. Check your email and intern ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'View your daily status and task notes',
    'No account password — only your registered email and intern ID',
    'Same records your manager marks in the attendance hub',
  ];

  return (
    <AuthSplitShell
      leftBadge="Graphura"
      leftIcon={CalendarCheck}
      leftTitle="Intern attendance"
      leftDescription="Confirm your registered email and intern ID to see your attendance history."
      highlights={highlights}
      rightEyebrow="Self-service"
      rightTitle="Check your attendance"
      rightSubtitle="Use the email and intern ID on file with your team."
      footer={
        <p className="mt-6 text-center text-sm text-slate-500">
          Wrong details?{' '}
          <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Back to home
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto lg:mx-0">
        {error && (
          <div
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="intern-email"
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
            <input
              id="intern-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="intern-id"
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            Intern ID
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
            <input
              id="intern-id"
              type="text"
              required
              value={internId}
              onChange={(e) => setInternId(e.target.value)}
              placeholder="Your employee / intern ID"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking…
            </>
          ) : (
            'View attendance'
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
};

export default InternAttendanceCheck;
