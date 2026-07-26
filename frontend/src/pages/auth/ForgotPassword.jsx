import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';
import { Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your college email to receive a 6-digit OTP code</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition disabled:opacity-50 mt-4"
        >
          {loading ? 'Sending OTP...' : 'Send OTP Code'}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
        </button>
      </div>
    </div>
  );
}
