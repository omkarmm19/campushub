import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Building, Home, Check, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const inputCls = 'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    block_number: user?.block_number || '',
    room_number: user?.room_number || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-sm text-slate-500">Update your student information</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Non-editable details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Registration No.</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{user?.reg_number}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">College Email</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{user?.college_email}</p>
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className={inputCls}
              maxLength={10}
            />
          </div>
        </div>

        {/* Block & Room */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Block Number *</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="block_number"
                required
                value={formData.block_number}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Number *</label>
            <div className="relative">
              <Home className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="room_number"
                required
                value={formData.room_number}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Check className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
