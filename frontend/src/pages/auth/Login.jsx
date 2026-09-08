import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const inputCls =
  'w-full pl-9 pr-10 py-2 bg-[#111113] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#55555C] focus:outline-none focus:border-[#22D3EE] transition-colors font-mono';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ college_email: email.trim().toLowerCase(), password: password.trim() });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-[#111113] rounded-md border border-[#26262B]">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Welcome Back</h1>
        <p className="text-xs text-[#8A8A93] mt-1">Sign in with your college email to access CampusHub</p>
      </div>

      {successMessage && (
        <div className="mb-5 p-3 bg-[#17171A] border border-[#34D399]/30 text-[#34D399] rounded-md flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 bg-[#17171A] border border-[#F87171]/30 text-[#F87171] rounded-md flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">College Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-mono text-[#8A8A93] hover:text-[#22D3EE] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#8A8A93] hover:text-[#F2F2F3] transition-colors"
              tabIndex="-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[#8A8A93] mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[#22D3EE] font-medium hover:underline">
          Register now
        </Link>
      </p>
    </div>
  );
}
