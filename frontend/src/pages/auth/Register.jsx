import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Building, Home, CreditCard, AlertCircle, Loader2 } from 'lucide-react';

const inputCls =
  'w-full pl-9 pr-3 py-2 bg-[#111113] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#55555C] focus:outline-none focus:border-[#F5A623] transition-colors font-mono';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    reg_number: '',
    college_email: '',
    phone: '',
    block_number: '',
    room_number: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful. Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 bg-[#111113] rounded-md border border-[#26262B]">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Create CampusHub Account</h1>
        <p className="text-xs text-[#8A8A93] mt-1">Join your campus student network</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-[#17171A] border border-[#F87171]/30 text-[#F87171] rounded-md flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Registration Number *</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
              <input
                type="text"
                name="reg_number"
                required
                value={formData.reg_number}
                onChange={handleChange}
                placeholder="21BCE1045"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">College Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="email"
              name="college_email"
              required
              value={formData.college_email}
              onChange={handleChange}
              placeholder="rahul.sharma2021@vitbhopal.ac.in"
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className={inputCls}
              maxLength={10}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Block Number *</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
              <input
                type="text"
                name="block_number"
                required
                value={formData.block_number}
                onChange={handleChange}
                placeholder="Block 2"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Room Number *</label>
            <div className="relative">
              <Home className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
              <input
                type="text"
                name="room_number"
                required
                value={formData.room_number}
                onChange={handleChange}
                placeholder="402"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A93]" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F5A623] hover:bg-[#D98E1C] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[#8A8A93] mt-6">
        Already registered?{' '}
        <Link to="/login" className="text-[#F5A623] font-medium hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
}
