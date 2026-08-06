import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, IndianRupee, Tag, Upload, X, Check, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Item Info', 'Images', 'Review'];

const CATEGORIES = ['book', 'gadget', 'clothing', 'furniture', 'stationary', 'other'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New', desc: 'Never used' },
  { value: 'good', label: 'Good', desc: 'Light use, great condition' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, works fine' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear / needs repair' },
];
const LISTING_TYPES = [
  { value: 'sell', label: '💰 Sell', desc: 'One-time payment' },
  { value: 'rent', label: '🔑 Rent', desc: 'Per month basis' },
  { value: 'free', label: '🎁 Give Away', desc: 'No charge' },
];

const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
            i < current ? 'bg-indigo-600 text-white' : i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-100 text-slate-400'
          }`}>
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`hidden sm:block ml-2 text-xs font-semibold ${i === current ? 'text-indigo-600' : i < current ? 'text-slate-600' : 'text-slate-400'}`}>
            {step}
          </span>
          {i < STEPS.length - 1 && <div className={`h-0.5 w-10 sm:w-16 mx-2 transition-all ${i < current ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'book',
    condition: 'good',
    price: '',
    listing_type: 'sell',
    whatsapp: user?.phone || '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleImages = (files) => {
    const arr = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((p) => [...p, ...arr]);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((p) => [...p, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setImageFiles((f) => f.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    if (step === 0) {
      if (!form.title.trim()) { setError('Please add a title.'); return false; }
      if (!form.description.trim()) { setError('Please add a description.'); return false; }
      if (form.listing_type !== 'free' && (!form.price || parseInt(form.price) < 0)) { setError('Please enter a valid price.'); return false; }
      if (!/^\d{10}$/.test(form.whatsapp)) { setError('Enter a valid 10-digit WhatsApp number.'); return false; }
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: form.listing_type === 'free' ? 0 : parseInt(form.price),
      };
      const created = await marketplaceAPI.createItem(payload);
      if (imageFiles.length > 0) await marketplaceAPI.uploadImages(created.id, imageFiles);
      navigate(`/marketplace/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post item. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><ShoppingBag className="h-4 w-4" /></div>
          <h1 className="text-2xl font-bold text-slate-900">Post an Item</h1>
        </div>
        <p className="text-sm text-slate-500 ml-9">List something to sell, rent, or give away</p>
      </div>

      <StepBar current={step} />

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        {/* Step 0: Item Info */}
        {step === 0 && (
          <>
            {/* Listing Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Listing Type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {LISTING_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => set('listing_type', t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition ${form.listing_type === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <p className="font-semibold text-slate-800 text-sm">{t.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. Engineering Mathematics by RD Sharma" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} maxLength={200} />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => set('category', c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${form.category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Condition <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONDITIONS.map((c) => (
                  <button key={c.value} type="button" onClick={() => set('condition', c.value)}
                    className={`p-3 rounded-xl border-2 text-left transition ${form.condition === c.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <p className="font-semibold text-slate-800 text-xs">{c.label}</p>
                    <p className="text-xs text-slate-400">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Price + WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Price (₹) {form.listing_type !== 'free' && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="number" placeholder="e.g. 250" value={form.price} onChange={(e) => set('price', e.target.value)} disabled={form.listing_type === 'free'} className={`${inputCls} pl-9 disabled:opacity-50`} />
                </div>
                {form.listing_type === 'free' && <p className="text-xs text-emerald-600 font-medium">Listed as free 🎁</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp <span className="text-red-400">*</span></label>
                <input type="tel" placeholder="10-digit number" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} maxLength={10} />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description <span className="text-red-400">*</span></label>
              <textarea rows={4} placeholder="Describe the item, its condition, why you're selling, etc." value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} />
            </div>
          </>
        )}

        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Upload up to <strong>5 photos</strong> of the item.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageFiles.length >= 5}
              className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:text-indigo-500 transition disabled:opacity-40">
              <Upload className="h-8 w-8" />
              <div className="text-center">
                <p className="font-semibold text-sm">Click to upload photos</p>
                <p className="text-xs mt-0.5">JPG, PNG, WEBP · Max 5 images</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">Cover</span>}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 text-center">{imageFiles.length}/5 · You can skip and add photos later</p>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-800">Review your listing</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Type', LISTING_TYPES.find(t => t.value === form.listing_type)?.label],
                ['Category', form.category],
                ['Condition', form.condition],
                ['Price', form.listing_type === 'free' ? 'Free' : `₹${parseInt(form.price || 0).toLocaleString('en-IN')}`],
                ['WhatsApp', form.whatsapp],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium">{k}</p>
                  <p className="text-slate-800 font-semibold capitalize">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1 font-medium">Title</p>
              <p className="font-semibold text-slate-800">{form.title}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1 font-medium">Description</p>
              <p className="text-slate-600 text-sm line-clamp-3">{form.description}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium">Photos</p>
              <p className="text-slate-700 font-semibold">{imageFiles.length} photo(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex justify-between mt-6">
        <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => { if (validate()) setStep((s) => s + 1); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><Check className="h-4 w-4" /> Publish Item</>}
          </button>
        )}
      </div>
    </div>
  );
}
