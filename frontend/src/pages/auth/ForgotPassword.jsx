import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';
import { Mail, KeyRound, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const inputCls =
  'w-full pl-9 pr-3 py-2 bg-[#111113] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#55555C] focus:outline-none focus:border-[#22D3EE] transition-colors font-mono';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      navigate('/reset-password', { state: { college_email: email } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-[#111113] rounded-md border border-[#26262B]">
      <div className="text-center mb-6">
        <div className="mx-auto w-10 h-10 bg-[#17171A] border border-[#26262B] text-[#22D3EE] rounded-md flex items-center justify-center mb-3">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Forgot Password</h1>
        <p className="text-xs text-[#8A8A93] mt-1">Enter your college email to receive a 6-digit OTP code</p>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending OTP...
            </>
          ) : (
            'Send OTP Code'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-[#8A8A93] hover:text-[#F2F2F3] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
        </button>
      </div>
    </div>
  );
}
