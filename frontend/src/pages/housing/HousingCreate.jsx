import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, IndianRupee, MapPin, Calendar, FileText, Phone,
  ChevronRight, ChevronLeft, Upload, X, Check, AlertCircle, Loader2,
} from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Listing Info', 'Preferences', 'Images', 'Review'];

const AMENITY_OPTIONS = ['WiFi', 'Electricity', 'Water', 'Parking', 'Mess', 'AC', 'Laundry', 'Security'];

const SHARING_OPTIONS = [
  { value: 'single', label: 'Single', desc: 'Only you' },
  { value: 'double', label: 'Double', desc: '2 people' },
  { value: 'triple', label: 'Triple', desc: '3 people' },
  { value: 'other', label: 'Other', desc: 'Custom' },
];

const LISTING_TYPE_OPTIONS = [
  { value: 'room_available', label: '🏠 Room Available', desc: 'I have a room to offer' },
  { value: 'roommate_needed', label: '🤝 Roommate Needed', desc: 'I need a roommate' },
];

// Step indicator
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
            i < current
              ? 'bg-indigo-600 text-white'
              : i === current
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
              : 'bg-slate-100 text-slate-400'
          }`}>
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`hidden sm:block ml-2 text-xs font-semibold ${
            i === current ? 'text-indigo-600' : i < current ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 sm:w-12 mx-2 transition-all ${
              i < current ? 'bg-indigo-600' : 'bg-slate-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Field wrapper
function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// Input style helper
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

export default function HousingCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    listing_type: 'room_available',
    rent_per_person: '',
    security_deposit: '',
    location: '',
    distance_km: '',
    sharing_type: 'double',
    available_from: '',
    amenities: [],
    description: '',
    whatsapp: user?.phone || '',
    pref_veg: null,
    pref_smoking: null,
    pref_study_friendly: null,
    pref_sleep_schedule: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleImages = (files) => {
    const arr = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setImageFiles((f) => f.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.rent_per_person || !form.sharing_type || !form.available_from || !form.whatsapp) {
        setError('Please fill in all required fields.');
        return false;
      }
      if (!/^\d{10}$/.test(form.whatsapp)) {
        setError('Enter a valid 10-digit WhatsApp number.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.description.trim()) {
        setError('Please add a description.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        rent_per_person: parseInt(form.rent_per_person),
        security_deposit: form.security_deposit ? parseInt(form.security_deposit) : null,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        amenities: form.amenities.map((a) => a.toLowerCase()),
        pref_sleep_schedule: form.pref_sleep_schedule || null,
      };

      const created = await housingAPI.createListing(payload);

      if (imageFiles.length > 0) {
        await housingAPI.uploadImages(created.id, imageFiles);
      }

      navigate(`/housing/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create listing. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <Home className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Post a Housing Listing</h1>
        </div>
        <p className="text-sm text-slate-500 ml-9">Fill in the details to find your perfect match</p>
      </div>

      <StepBar current={step} />

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        {/* ─── Step 0: Listing Info ─── */}
        {step === 0 && (
          <>
            <Field label="Listing Type" required>
              <div className="grid grid-cols-2 gap-3">
                {LISTING_TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('listing_type', t.value)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      form.listing_type === t.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-800 text-sm">{t.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Rent per Person (₹/month)" required>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    placeholder="e.g. 6000"
                    value={form.rent_per_person}
                    onChange={(e) => set('rent_per_person', e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Security Deposit (₹)">
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={form.security_deposit}
                    onChange={(e) => set('security_deposit', e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            </div>

            <Field label="Sharing Type" required>
              <div className="grid grid-cols-4 gap-2">
                {SHARING_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set('sharing_type', s.value)}
                    className={`p-3 rounded-xl border-2 text-center transition ${
                      form.sharing_type === s.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Users className={`h-4 w-4 mx-auto mb-1 ${form.sharing_type === s.value ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location / Area">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Kothrud, Pune"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Distance from College (km)">
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  value={form.distance_km}
                  onChange={(e) => set('distance_km', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Available From" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={form.available_from}
                    onChange={(e) => set('available_from', e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="WhatsApp Number" required hint="10-digit number without +91">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                    className={`${inputCls} pl-9`}
                    maxLength={10}
                  />
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
          </>
        )}

        {/* ─── Step 1: Preferences & Description ─── */}
        {step === 1 && (
          <>
            <Field label="Description" required hint="Describe the room, neighbourhood, house rules, etc.">
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  rows={5}
                  placeholder="e.g. Spacious 2BHK flat near college main gate. 24/7 water supply, gated society..."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className={`${inputCls} pl-9 resize-none`}
                />
              </div>
            </Field>

            {form.listing_type === 'room_available' && (
              <>
                <h3 className="font-semibold text-slate-700 text-sm pt-2">Roommate Preferences (Optional)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'pref_veg', label: '🥗 Vegetarian only' },
                    { key: 'pref_smoking', label: '🚬 Non-smoking only' },
                    { key: 'pref_study_friendly', label: '📚 Study-friendly' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set(key, form[key] === true ? null : true)}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition ${
                        form[key] === true
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <Field label="Preferred sleep schedule">
                  <select
                    value={form.pref_sleep_schedule}
                    onChange={(e) => set('pref_sleep_schedule', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No preference</option>
                    <option value="early">Early bird (sleeps by 10pm)</option>
                    <option value="night_owl">Night owl (sleeps after midnight)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </Field>
              </>
            )}
          </>
        )}

        {/* ─── Step 2: Images ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Upload up to <strong>5 photos</strong> of the room. Good photos get more responses!
            </p>

            {/* Dropzone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageFiles.length >= 5}
              className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:text-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="h-8 w-8" />
              <div className="text-center">
                <p className="font-semibold text-sm">Click to upload photos</p>
                <p className="text-xs mt-0.5">JPG, PNG, WEBP · Max 5 images</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImages(e.target.files)}
            />

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <img src={src} alt={`preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              {imageFiles.length}/5 images selected · You can also skip and add photos later
            </p>
          </div>
        )}

        {/* ─── Step 3: Review ─── */}
        {step === 3 && (
          <div className="space-y-4 text-sm">
            <h2 className="font-bold text-slate-800">Review your listing</h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Type', form.listing_type === 'room_available' ? '🏠 Room Available' : '🤝 Roommate Needed'],
                ['Rent', `₹${parseInt(form.rent_per_person || 0).toLocaleString('en-IN')}/month`],
                ['Deposit', form.security_deposit ? `₹${parseInt(form.security_deposit).toLocaleString('en-IN')}` : 'None'],
                ['Sharing', form.sharing_type],
                ['Location', form.location || 'Not specified'],
                ['Distance', form.distance_km ? `${form.distance_km} km` : 'Not specified'],
                ['Available', form.available_from],
                ['WhatsApp', form.whatsapp],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium">{k}</p>
                  <p className="text-slate-800 font-semibold capitalize">{v}</p>
                </div>
              ))}
            </div>

            {form.amenities.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium mb-1">Description</p>
              <p className="text-slate-700 text-sm leading-relaxed line-clamp-4">{form.description}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium">Photos</p>
              <p className="text-slate-700 font-semibold">{imageFiles.length} photo(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
            ) : (
              <><Check className="h-4 w-4" /> Publish Listing</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
