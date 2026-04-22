import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import AuthSplitShell from '../../components/auth/AuthSplitShell';
import {
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

const fieldClass =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const fieldClassToggle =
  'w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secretKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey,
      });
      login(res.data.user, res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    'Requires the administrator secret key from your organization',
    'Creates a full Admin role in Graphura',
    'Use a strong password—you’ll use it to sign in to the admin console',
  ];

  const footer = (
    <div className="mt-10 pt-8 border-t border-slate-200/80 text-center text-sm text-slate-500">
      Already registered?{' '}
      <Link
        to="/admin-login"
        className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Sign in
      </Link>
    </div>
  );

  return (
    <AuthSplitShell
      leftBadge="Graphura Admin"
      leftIcon={UserPlus}
      leftTitle="Create an administrator"
      leftDescription="Register only if you have been given the official secret key. This account can manage your whole organization in Graphura."
      highlights={highlights}
      minHeightClass="min-h-[600px]"
      rightEyebrow="Onboarding"
      rightTitle="Admin registration"
      rightSubtitle="Your name, work email, password, and the secret key you were provided."
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
            htmlFor="reg-name"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Full name
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Priya Sharma"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
          >
            Work email
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="reg-secret"
              className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              Admin secret key
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="reg-secret"
                name="secretKey"
                type={showSecret ? 'text' : 'password'}
                required
                value={formData.secretKey}
                onChange={handleChange}
                placeholder="Provided by your org"
                className={fieldClassToggle}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
              >
                {showSecret ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={fieldClassToggle}
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
              <UserPlus className="w-5 h-5 opacity-90" />
              Create admin account
            </>
          )}
        </button>
      </form>
    </AuthSplitShell>
  );
};

export default AdminRegister;
