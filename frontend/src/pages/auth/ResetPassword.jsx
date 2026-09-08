import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';
import { KeyRound, Lock, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 bg-[#111113] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#55555C] focus:outline-none focus:border-[#22D3EE] transition-colors font-mono';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.college_email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-[#111113] rounded-md border border-[#26262B]">
      <div className="text-center mb-6">
        <div className="mx-auto w-10 h-10 bg-[#17171A] border border-[#26262B] text-[#34D399] rounded-md flex items-center justify-center mb-3">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Reset Password</h1>
        <p className="text-xs text-[#8A8A93] mt-1">Enter your 6-digit OTP code and choose a new password</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-[#17171A] border border-[#F87171]/30 text-[#F87171] rounded-md flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">College Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">6-Digit OTP Code</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className={`${inputCls} pl-9 tracking-widest`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
