import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit3, IndianRupee, MapPin, Calendar, Phone, FileText,
  Loader2, AlertCircle, Check, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';

const AMENITY_OPTIONS = ['WiFi', 'Electricity', 'Water', 'Parking', 'Mess', 'AC', 'Laundry', 'Security'];
const SHARING_OPTIONS = ['single', 'double', 'triple', 'other'];

const inputCls = 'w-full px-3 py-2 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] focus:outline-none focus:border-[#22D3EE] placeholder:text-[#71717A] font-mono';

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono uppercase tracking-wider text-[#8B8B92]">{label}</label>
      {children}
      {hint && <p className="text-[11px] font-mono text-[#71717A]">{hint}</p>}
    </div>
  );
}

export default function HousingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await housingAPI.getListing(id);
        if (data.user_id !== user?.id && !user?.is_admin) {
          navigate('/housing', { replace: true });
          return;
        }
        setForm({
          rent_per_person: data.rent_per_person ?? '',
          security_deposit: data.security_deposit ?? '',
          location: data.location ?? '',
          distance_km: data.distance_km ?? '',
          sharing_type: data.sharing_type ?? 'double',
          available_from: data.available_from ?? '',
          amenities: data.amenities?.map((a) => {
            const cap = a.charAt(0).toUpperCase() + a.slice(1);
            return AMENITY_OPTIONS.find((o) => o.toLowerCase() === a.toLowerCase()) || cap;
          }) ?? [],
          description: data.description ?? '',
          whatsapp: data.whatsapp ?? '',
          pref_veg: data.pref_veg,
          pref_smoking: data.pref_smoking,
          pref_study_friendly: data.pref_study_friendly,
          pref_sleep_schedule: data.pref_sleep_schedule ?? '',
          is_active: data.is_active ?? true,
        });
      } catch {
        setError('Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, navigate]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.whatsapp || !/^\d{10}$/.test(form.whatsapp)) {
      setError('Enter a valid 10-digit WhatsApp number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await housingAPI.updateListing(id, {
        ...form,
        rent_per_person: parseInt(form.rent_per_person),
        security_deposit: form.security_deposit ? parseInt(form.security_deposit) : null,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        amenities: form.amenities.map((a) => a.toLowerCase()),
        pref_sleep_schedule: form.pref_sleep_schedule || null,
      });
      navigate(`/housing/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-[#8B8B92]">
        {error || 'Unable to load listing.'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="border-b border-[#26262B] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Edit3 className="h-5 w-5 text-[#F2F2F3]" />
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">
            Edit Listing
          </h1>
        </div>
        <p className="text-xs text-[#8B8B92]">Update your housing listing information</p>
      </div>

      {error && (
        <div className="p-3 bg-[#111113] border border-red-500/30 rounded-md flex items-center gap-2.5 text-xs text-red-400 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-5">

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 bg-[#17171A] rounded-md border border-[#26262B]">
          <div>
            <p className="text-xs font-semibold text-[#F2F2F3]">Listing Status</p>
            <p className="text-[11px] font-mono text-[#71717A] mt-0.5">
              {form.is_active ? 'Visible to everyone' : 'Hidden from listings feed'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono font-medium transition ${
              form.is_active
                ? 'border border-[#34D399]/30 bg-[#34D399]/10 text-[#34D399]'
                : 'border border-[#26262B] bg-[#111113] text-[#71717A]'
            }`}
          >
            {form.is_active
              ? <><ToggleRight className="h-4 w-4" /> Active</>
              : <><ToggleLeft className="h-4 w-4" /> Inactive</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rent per Person (₹/mo)">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
              <input type="number" value={form.rent_per_person} onChange={(e) => set('rent_per_person', e.target.value)} className={`${inputCls} pl-8`} required />
            </div>
          </Field>
          <Field label="Security Deposit (₹)">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
              <input type="number" value={form.security_deposit} onChange={(e) => set('security_deposit', e.target.value)} className={`${inputCls} pl-8`} />
            </div>
          </Field>
        </div>

        <Field label="Sharing Type">
          <div className="flex gap-2">
            {SHARING_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('sharing_type', s)}
                className={`flex-1 py-1.5 rounded-sm border text-xs font-mono capitalize transition ${
                  form.sharing_type === s
                    ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8B8B92] hover:border-[#3A3A42]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Location / Area">
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={`${inputCls} pl-8`} placeholder="e.g. Near Gate 3" />
            </div>
          </Field>
          <Field label="Distance (km)">
            <input type="number" step="0.5" value={form.distance_km} onChange={(e) => set('distance_km', e.target.value)} className={inputCls} placeholder="e.g. 2" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Available From">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
              <input type="date" value={form.available_from} onChange={(e) => set('available_from', e.target.value)} className={`${inputCls} pl-8`} required />
            </div>
          </Field>
          <Field label="WhatsApp Number" hint="10-digit without +91">
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
              <input type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={`${inputCls} pl-8`} maxLength={10} required />
            </div>
          </Field>
        </div>

        <Field label="Amenities">
          <div className="flex flex-wrap gap-1.5">
            {AMENITY_OPTIONS.map((a) => {
              const active = form.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-2.5 py-1 rounded-sm text-xs font-mono border transition ${
                    active
                      ? 'border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE]'
                      : 'border-[#26262B] bg-[#17171A] text-[#8B8B92] hover:text-[#F2F2F3]'
                  }`}
                >
                  {active && <span className="mr-1 text-[#22D3EE]">✓</span>}
                  {a}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Description">
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} pl-8 resize-none`} required />
          </div>
        </Field>

        {/* Preferences */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B8B92]">Roommate Preferences</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'pref_veg', label: 'Vegetarian' },
              { key: 'pref_smoking', label: 'Non-smoking' },
              { key: 'pref_study_friendly', label: 'Study-friendly' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, form[key] === true ? null : true)}
                className={`p-2.5 rounded-sm border text-left text-xs font-mono transition ${
                  form[key] === true
                    ? 'border-[#34D399]/30 bg-[#34D399]/10 text-[#34D399]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8B8B92] hover:border-[#3A3A42]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2 border border-[#26262B] rounded-md text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-semibold text-xs rounded-md transition disabled:opacity-60"
          >
            {submitting
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
              : <><Check className="h-3.5 w-3.5" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
