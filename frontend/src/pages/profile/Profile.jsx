import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Building, Home, Check, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const inputCls =
  'w-full pl-9 pr-3 py-2 bg-[#111113] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#55555C] focus:outline-none focus:border-[#F5A623] transition-colors font-mono';

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
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      {/* Page Header */}
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <User className="h-5 w-5 text-[#F5A623] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Profile Settings</h1>
          <p className="text-xs text-[#8A8A93]">Update your student account details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#34D399]/30 rounded-md flex items-center gap-2 text-xs text-[#34D399]">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        {/* Non-editable details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#17171A] rounded-md border border-[#26262B]">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Registration No.</p>
            <p className="text-xs font-mono text-[#F2F2F3] mt-0.5">{user?.reg_number || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">College Email</p>
            <p className="text-xs font-mono text-[#F2F2F3] mt-0.5 truncate">{user?.college_email || '—'}</p>
          </div>
        </div>

        {/* Name */}
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
              className={inputCls}
            />
          </div>
        </div>

        {/* Phone */}
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
              className={inputCls}
              maxLength={10}
            />
          </div>
        </div>

        {/* Block & Room */}
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
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-[#26262B]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2 border border-[#26262B] hover:border-[#38383F] rounded-md text-xs font-medium text-[#8A8A93] hover:text-[#F2F2F3] hover:bg-[#17171A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F5A623] hover:bg-[#D98E1C] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
