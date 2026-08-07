import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, IndianRupee, Check, AlertCircle,
  Loader2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['book', 'gadget', 'clothing', 'furniture', 'stationary', 'other'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];
const LISTING_TYPES = [
  { value: 'sell', label: '💰 Sell' },
  { value: 'rent', label: '🔑 Rent' },
  { value: 'free', label: '🎁 Free' },
];

const inputCls =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function MarketplaceEdit() {
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
        const data = await marketplaceAPI.getItem(id);
        if (data.user_id !== user?.id && !user?.is_admin) {
          navigate('/marketplace', { replace: true });
          return;
        }
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? 'book',
          condition: data.condition ?? 'good',
          price: data.price ?? '',
          listing_type: data.listing_type ?? 'sell',
          whatsapp: data.whatsapp ?? '',
          is_sold: data.is_sold ?? false,
          is_active: data.is_active ?? true,
        });
      } catch {
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, navigate]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (form.listing_type !== 'free' && (!form.price || parseInt(form.price) < 0)) {
      setError('Please enter a valid price.');
      return;
    }
    if (!/^\d{10}$/.test(form.whatsapp)) {
      setError('Enter a valid 10-digit WhatsApp number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await marketplaceAPI.updateItem(id, {
        ...form,
        price: form.listing_type === 'free' ? 0 : parseInt(form.price),
      });
      navigate(`/marketplace/${id}`);
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
        {error || 'Unable to load item.'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Item</h1>
          <p className="text-sm text-slate-500">Update your marketplace listing</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        {/* Status toggles */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'is_active', activeLabel: 'Active', inactiveLabel: 'Hidden', activeColor: 'bg-emerald-100 text-emerald-700', inactiveColor: 'bg-slate-200 text-slate-500' },
            { key: 'is_sold', activeLabel: 'Sold', inactiveLabel: 'Available', activeColor: 'bg-red-100 text-red-600', inactiveColor: 'bg-emerald-100 text-emerald-700' },
          ].map(({ key, activeLabel, inactiveLabel, activeColor, inactiveColor }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 capitalize">{key === 'is_active' ? 'Status' : 'Sold?'}</p>
              <button
                type="button"
                onClick={() => set(key, !form[key])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  form[key] ? activeColor : inactiveColor
                }`}
              >
                {form[key]
                  ? <><ToggleRight className="h-4 w-4" />{activeLabel}</>
                  : <><ToggleLeft className="h-4 w-4" />{inactiveLabel}</>}
              </button>
            </div>
          ))}
        </div>

        {/* Listing Type */}
        <Field label="Listing Type">
          <div className="grid grid-cols-3 gap-2">
            {LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('listing_type', t.value)}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition ${
                  form.listing_type === t.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field label="Title *">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            maxLength={200}
            required
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('category', c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${
                  form.category === c
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        {/* Condition */}
        <Field label="Condition">
          <div className="grid grid-cols-4 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('condition', c.value)}
                className={`py-2 px-2 rounded-xl border-2 text-xs font-semibold transition text-center ${
                  form.condition === c.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Price + WhatsApp */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                disabled={form.listing_type === 'free'}
                className={`${inputCls} pl-9 disabled:opacity-50`}
              />
            </div>
          </Field>
          <Field label="WhatsApp" hint="10-digit, no +91">
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              className={inputCls}
              maxLength={10}
              required
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description *">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </Field>

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
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-60"
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
