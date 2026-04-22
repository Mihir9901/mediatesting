import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import AuthSplitShell from '../../components/auth/AuthSplitShell';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCircle,
} from 'lucide-react';
import { requireGeolocation } from '../../utils/requireGeolocation';

const inputClass =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const inputClassWithToggle =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const TeamHeadLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { latitude, longitude } = await requireGeolocation();
      const res = await api.post('/user/login', {
        email: email.trim().toLowerCase(),
        password,
        latitude,
        longitude,
      });

      const userData = res.data.user;
      if (userData.role !== 'TeamHead') {
        setError('This login is only for team heads. Use manager login for other accounts.');
        return;
      }

      login(userData, res.data.token);
      navigate('/team-head');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Login failed. Check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'Mark attendance for interns in your team',
    'View reports for your team only',
    'Credentials are issued by your manager',
  ];

  const footer = (
    <div className="mt-10 pt-8 border-t border-slate-200/80 space-y-3 text-center text-sm text-slate-500">
      <p>
        Manager or admin?{' '}
        <Link
          to="/manager-login"
          className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Manager login
        </Link>
      </p>
    </div>
  );

  return (
    <AuthSplitShell
      leftBadge="Graphura"
      leftIcon={UserCircle}
      leftTitle="Team head portal"
      leftDescription="Sign in with the email and password your manager created for you."
      highlights={highlights}
      rightEyebrow="Team access"
      rightTitle="Team head sign in"
      rightSubtitle="Use your team head account — not the manager login."
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto lg:mx-0">
        {error && (
          <div
            className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="th-email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="th-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teamhead@company.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="th-password" className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="th-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClassWithToggle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
};

export default TeamHeadLogin;
