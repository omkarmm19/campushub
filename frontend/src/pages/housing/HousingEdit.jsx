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

const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
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
        // Authorization check
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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">
        {error || 'Unable to load listing.'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
          <Edit3 className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
          <p className="text-sm text-slate-500">Update your housing listing details</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-700">Listing Status</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {form.is_active ? 'Visible to everyone' : 'Hidden from listings'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('is_active', !form.is_active)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              form.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {form.is_active
              ? <><ToggleRight className="h-5 w-5" /> Active</>
              : <><ToggleLeft className="h-5 w-5" /> Inactive</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Rent per Person (₹/month)">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="number" value={form.rent_per_person} onChange={(e) => set('rent_per_person', e.target.value)} className={`${inputCls} pl-9`} required />
            </div>
          </Field>
          <Field label="Security Deposit (₹)">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="number" value={form.security_deposit} onChange={(e) => set('security_deposit', e.target.value)} className={`${inputCls} pl-9`} />
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
                className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold capitalize transition ${
                  form.sharing_type === s
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location / Area">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={`${inputCls} pl-9`} placeholder="e.g. Kothrud" />
            </div>
          </Field>
          <Field label="Distance from College (km)">
            <input type="number" step="0.5" value={form.distance_km} onChange={(e) => set('distance_km', e.target.value)} className={inputCls} placeholder="e.g. 2" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Available From">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="date" value={form.available_from} onChange={(e) => set('available_from', e.target.value)} className={`${inputCls} pl-9`} required />
            </div>
          </Field>
          <Field label="WhatsApp Number" hint="10-digit, no +91">
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={`${inputCls} pl-9`} maxLength={10} required />
            </div>
          </Field>
        </div>

        <Field label="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  form.amenities.includes(a)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {form.amenities.includes(a) && <span className="mr-1">✓</span>}
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description">
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} pl-9 resize-none`} required />
          </div>
        </Field>

        {/* Preferences */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm">Roommate Preferences</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'pref_veg', label: '🥗 Vegetarian' },
              { key: 'pref_smoking', label: '🚬 Non-smoking' },
              { key: 'pref_study_friendly', label: '📚 Study-friendly' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, form[key] === true ? null : true)}
                className={`p-3 rounded-xl border-2 text-left text-xs font-medium transition ${
                  form[key] === true
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              : <><Check className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
