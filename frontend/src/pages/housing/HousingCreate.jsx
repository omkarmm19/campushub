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
  { value: 'single', label: 'Single', desc: 'Single room' },
  { value: 'double', label: 'Double', desc: '2 people' },
  { value: 'triple', label: 'Triple', desc: '3 people' },
  { value: 'other', label: 'Other', desc: 'Custom sharing' },
];

const LISTING_TYPE_OPTIONS = [
  { value: 'room_available', label: 'Room Available', desc: 'I have a room to offer' },
  { value: 'roommate_needed', label: 'Roommate Needed', desc: 'I need a flatmate/roommate' },
];

// Step indicator
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
            <div className={`h-px w-6 sm:w-10 ${
              i < current ? 'bg-[#34D399]/40' : 'bg-[#26262B]'
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
      <label className="text-[11px] font-mono uppercase tracking-wider text-[#8B8B92]">
        {label} {required && <span className="text-[#F5A623]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] font-mono text-[#71717A]">{hint}</p>}
    </div>
  );
}

// Input style helper
const inputCls = 'w-full px-3 py-2 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] focus:outline-none focus:border-[#F5A623] placeholder:text-[#71717A] font-mono';

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
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="border-b border-[#26262B] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Home className="h-5 w-5 text-[#F2F2F3]" />
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">
            Post a Housing Listing
          </h1>
        </div>
        <p className="text-xs text-[#8B8B92]">
          Fill in details to list a room or find roommates near college
        </p>
      </div>

      <StepBar current={step} />

      {error && (
        <div className="p-3 bg-[#111113] border border-red-500/30 rounded-md flex items-center gap-2.5 text-xs text-red-400 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-5">

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
                    className={`p-3 rounded-md border text-left transition ${
                      form.listing_type === t.value
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-[#26262B] bg-[#17171A] hover:border-[#3A3A42] text-[#8B8B92]'
                    }`}
                  >
                    <p className="font-semibold text-xs text-[#F2F2F3]">{t.label}</p>
                    <p className="text-[11px] font-mono text-[#71717A] mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Rent per Person (₹/mo)" required>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="number"
                    placeholder="e.g. 6000"
                    value={form.rent_per_person}
                    onChange={(e) => set('rent_per_person', e.target.value)}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </Field>
              <Field label="Security Deposit (₹)">
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={form.security_deposit}
                    onChange={(e) => set('security_deposit', e.target.value)}
                    className={`${inputCls} pl-8`}
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
                    className={`p-2.5 rounded-md border text-center transition ${
                      form.sharing_type === s.value
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-[#26262B] bg-[#17171A] hover:border-[#3A3A42] text-[#8B8B92]'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5 mx-auto mb-1" />
                    <p className="text-xs font-medium text-[#F2F2F3]">{s.label}</p>
                    <p className="text-[10px] font-mono text-[#71717A]">{s.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Location / Area">
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="e.g. Near Main Gate"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </Field>
              <Field label="Distance (km)">
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="Available From" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="date"
                    value={form.available_from}
                    onChange={(e) => set('available_from', e.target.value)}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </Field>
              <Field label="WhatsApp Number" required hint="10-digit number without +91">
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                    className={`${inputCls} pl-8`}
                    maxLength={10}
                  />
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
                          ? 'border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]'
                          : 'border-[#26262B] bg-[#17171A] text-[#8B8B92] hover:text-[#F2F2F3]'
                      }`}
                    >
                      {active && <span className="mr-1 text-[#F5A623]">✓</span>}
                      {a}
                    </button>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        {/* ─── Step 1: Preferences & Description ─── */}
        {step === 1 && (
          <>
            <Field label="Description" required hint="Describe room amenities, rules, and nearby points">
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                <textarea
                  rows={5}
                  placeholder="e.g. Spacious 2BHK flat near college main gate. 24/7 water supply..."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className={`${inputCls} pl-8 resize-none`}
                />
              </div>
            </Field>

            {form.listing_type === 'room_available' && (
              <>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B8B92] pt-2">
                  Roommate Preferences (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'pref_veg', label: 'Vegetarian Only' },
                    { key: 'pref_smoking', label: 'Non-smoking Only' },
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

                <Field label="Sleep Schedule">
                  <select
                    value={form.pref_sleep_schedule}
                    onChange={(e) => set('pref_sleep_schedule', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No preference</option>
                    <option value="early">Early bird (sleeps before 11pm)</option>
                    <option value="night_owl">Night owl (sleeps after midnight)</option>
                    <option value="flexible">Flexible schedule</option>
                  </select>
                </Field>
              </>
            )}
          </>
        )}

        {/* ─── Step 2: Images ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[#8B8B92]">
              Upload up to 5 photos. Real room photos get significantly more inquiries.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageFiles.length >= 5}
              className="w-full border border-dashed border-[#26262B] hover:border-[#3A3A42] bg-[#17171A] rounded-md p-6 flex flex-col items-center gap-2 text-[#71717A] hover:text-[#F2F2F3] transition disabled:opacity-40"
            >
              <Upload className="h-6 w-6 text-[#8B8B92]" />
              <div className="text-center font-mono">
                <p className="text-xs font-medium text-[#F2F2F3]">Click to select photos</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">JPG, PNG, WEBP · Up to 5 photos</p>
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

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative rounded-sm overflow-hidden aspect-square border border-[#26262B] bg-[#0E0E10]">
                    <img src={src} alt={`preview ${i}`} className="w-full h-full object-cover" />
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

        {/* ─── Step 3: Review ─── */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#F2F2F3]">
              Review Listing Details
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['Type', form.listing_type === 'room_available' ? 'Room Available' : 'Roommate Needed'],
                ['Rent', `₹${parseInt(form.rent_per_person || 0).toLocaleString('en-IN')}/mo`],
                ['Deposit', form.security_deposit ? `₹${parseInt(form.security_deposit).toLocaleString('en-IN')}` : 'None'],
                ['Sharing', `${form.sharing_type} sharing`],
                ['Location', form.location || 'Not specified'],
                ['Distance', form.distance_km ? `${form.distance_km} km` : 'Not specified'],
                ['Available', form.available_from],
                ['WhatsApp', form.whatsapp],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
                  <p className="text-[10px] font-mono text-[#71717A] uppercase">{k}</p>
                  <p className="text-xs font-medium text-[#F2F2F3] capitalize mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {form.amenities.length > 0 && (
              <div className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
                <p className="text-[10px] font-mono text-[#71717A] uppercase mb-1.5">Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {form.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-[#111113] border border-[#26262B] text-[#8B8B92] rounded-sm text-[11px] font-mono">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#17171A] border border-[#26262B] rounded-sm p-2.5">
              <p className="text-[10px] font-mono text-[#71717A] uppercase mb-1">Description</p>
              <p className="text-xs text-[#8B8B92] leading-relaxed line-clamp-4 whitespace-pre-wrap">{form.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
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
            onClick={nextStep}
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
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
            ) : (
              <><Check className="h-3.5 w-3.5" /> Publish Listing</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
