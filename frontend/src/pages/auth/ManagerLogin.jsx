import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import AuthSplitShell from '../../components/auth/AuthSplitShell';
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { requireGeolocation } from '../../utils/requireGeolocation';

const inputClass =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const inputClassWithToggle =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const ManagerLogin = () => {
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
      const res = await api.post('/manager/login', {
        email,
        password,
        latitude,
        longitude,
      });

      const userData = res.data.user;
      login(userData, res.data.token);

      if (userData.role === 'Manager') {
        navigate('/manager');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'Review team attendance and employee lists',
    'Mark attendance and keep records up to date',
    'Works with your department access in Graphura',
  ];

  const footer = (
    <div className="mt-10 pt-8 border-t border-slate-200/80 space-y-3 text-center text-sm text-slate-500">
      <p>
        Organization admin?{' '}
        <Link
          to="/admin-login"
          className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Admin login
        </Link>
      </p>
      <p>
        Team head (assigned by your manager)?{' '}
        <Link
          to="/team-head-login"
          className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Team head login
        </Link>
      </p>
    </div>
  );

  return (
    <AuthSplitShell
      leftBadge="Graphura Teams"
      leftIcon={Users}
      leftTitle="Manager portal"
      leftDescription="Sign in to manage your department’s people, attendance, and day-to-day operations."
      highlights={highlights}
      rightEyebrow="Department access"
      rightTitle="Sign in"
      rightSubtitle="Use your manager email and password."
      footer={footer}
    >
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
            htmlFor="mgr-email"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Work email
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              id="mgr-email"
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

        <div>
          <label
            htmlFor="mgr-password"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              id="mgr-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={inputClassWithToggle}
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

        <div className="flex justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
              <LogIn className="w-5 h-5 opacity-90" />
              Enter manager portal
            </>
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
};

export default ManagerLogin;
