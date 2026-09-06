import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, IndianRupee, Upload, X, Check, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
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
  { value: 'sell', label: 'Sell', desc: 'One-time payment' },
  { value: 'rent', label: 'Rent', desc: 'Monthly basis' },
  { value: 'free', label: 'Give Away', desc: 'Zero cost' },
];

const inputCls = 'w-full px-3 py-2 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] focus:outline-none focus:border-[#F5A623] placeholder:text-[#71717A] font-mono';

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex items-center justify-center h-6 w-6 rounded-sm text-xs font-mono font-medium transition ${
            i < current
              ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
              : i === current
              ? 'bg-[#F5A623] text-[#0A0A0B] font-semibold'
              : 'bg-[#17171A] border border-[#26262B] text-[#71717A]'
          }`}>
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          <span className={`hidden sm:block text-xs font-mono ${
            i === current ? 'text-[#F2F2F3] font-medium' : 'text-[#71717A]'
          }`}>
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-6 sm:w-10 ${i < current ? 'bg-[#34D399]/40' : 'bg-[#26262B]'}`} />
          )}
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
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div className="border-b border-[#26262B] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="h-5 w-5 text-[#F2F2F3]" />
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">Post an Item</h1>
        </div>
        <p className="text-xs text-[#8B8B92]">List something to sell, rent, or give away on campus</p>
      </div>

      <StepBar current={step} />

      {error && (
        <div className="p-3 bg-[#111113] border border-red-500/30 rounded-md flex items-center gap-2.5 text-xs text-red-400 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-5">

        {/* Step 0: Item Info */}
        {step === 0 && (
          <>
            {/* Listing Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                Listing Type <span className="text-[#F5A623]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('listing_type', t.value)}
                    className={`p-3 rounded-md border text-left transition ${
                      form.listing_type === t.value
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-[#26262B] bg-[#17171A] hover:border-[#3A3A42] text-[#8B8B92]'
                    }`}
                  >
                    <p className="font-semibold text-xs text-[#F2F2F3]">{t.label}</p>
                    <p className="text-[10px] font-mono text-[#71717A] mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                Title <span className="text-[#F5A623]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering Mathematics by RD Sharma"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                Category <span className="text-[#F5A623]">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const active = form.category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('category', c)}
                      className={`px-2.5 py-1 rounded-sm text-xs font-mono capitalize border transition ${
                        active
                          ? 'border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]'
                          : 'border-[#26262B] bg-[#17171A] text-[#8B8B92] hover:text-[#F2F2F3]'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                Condition <span className="text-[#F5A623]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('condition', c.value)}
                    className={`p-2.5 rounded-md border text-left transition ${
                      form.condition === c.value
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-[#26262B] bg-[#17171A] hover:border-[#3A3A42] text-[#8B8B92]'
                    }`}
                  >
                    <p className="font-medium text-xs text-[#F2F2F3]">{c.label}</p>
                    <p className="text-[10px] font-mono text-[#71717A]">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Price + WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                  Price (₹) {form.listing_type !== 'free' && <span className="text-[#F5A623]">*</span>}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    disabled={form.listing_type === 'free'}
                    className={`${inputCls} pl-8 disabled:opacity-50`}
                  />
                </div>
                {form.listing_type === 'free' && <p className="text-[11px] font-mono text-[#34D399]">Listed as Free</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                  WhatsApp Number <span className="text-[#F5A623]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  className={inputCls}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">
                Description <span className="text-[#F5A623]">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the item, condition, pickup location on campus..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
          </>
        )}

        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-[#8B8B92]">Upload up to 5 photos of the item.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageFiles.length >= 5}
              className="w-full border border-dashed border-[#26262B] hover:border-[#3A3A42] bg-[#17171A] rounded-md p-6 flex flex-col items-center gap-2 text-[#71717A] hover:text-[#F2F2F3] transition disabled:opacity-40"
            >
              <Upload className="h-6 w-6 text-[#8B8B92]" />
              <div className="text-center font-mono">
                <p className="text-xs font-medium text-[#F2F2F3]">Click to select item photos</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">JPG, PNG, WEBP · Up to 5 photos</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative rounded-sm overflow-hidden aspect-square border border-[#26262B] bg-[#0E0E10]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-[#0A0A0B]/80 text-[#F2F2F3] hover:text-red-400 rounded-sm transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-[#0A0A0B]/80 border border-[#26262B] text-[#F5A623] text-[10px] font-mono rounded-sm">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#F2F2F3]">Review Listing Details</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Type', LISTING_TYPES.find(t => t.value === form.listing_type)?.label],
                ['Category', form.category],
                ['Condition', form.condition],
                ['Price', form.listing_type === 'free' ? 'Free' : `₹${parseInt(form.price || 0).toLocaleString('en-IN')}`],
                ['WhatsApp', form.whatsapp],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
                  <p className="text-[10px] font-mono text-[#71717A] uppercase">{k}</p>
                  <p className="text-xs font-medium text-[#F2F2F3] capitalize mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
              <p className="text-[10px] font-mono text-[#71717A] uppercase mb-1">Title</p>
              <p className="font-semibold text-xs text-[#F2F2F3]">{form.title}</p>
            </div>
            <div className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
              <p className="text-[10px] font-mono text-[#71717A] uppercase mb-1">Description</p>
              <p className="text-xs text-[#8B8B92] line-clamp-3">{form.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-[#26262B] bg-[#111113] hover:bg-[#17171A] text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => { if (validate()) setStep((s) => s + 1); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#E0921B] text-[#0A0A0B] text-xs font-semibold rounded-md transition"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#E0921B] text-[#0A0A0B] text-xs font-semibold rounded-md transition disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</> : <><Check className="h-3.5 w-3.5" /> Publish Item</>}
          </button>
        )}
      </div>
    </div>
  );
}
