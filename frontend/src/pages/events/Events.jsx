import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, Plus, MapPin, Clock, ExternalLink, ArrowLeft,
  Edit, Trash2, AlertTriangle, Loader2, AlertCircle,
  RefreshCw, Check,
} from 'lucide-react';
import { eventsAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';

const TYPE_META = {
  technical: { label: '💻 Technical', color: 'bg-blue-100 text-blue-700' },
  cultural: { label: '🎨 Cultural', color: 'bg-pink-100 text-pink-700' },
  sports: { label: '⚽ Sports', color: 'bg-emerald-100 text-emerald-700' },
  seminar: { label: '🎤 Seminar', color: 'bg-amber-100 text-amber-700' },
  other: { label: '📅 Other', color: 'bg-slate-100 text-slate-600' },
};

const EVENT_TYPES = ['technical', 'cultural', 'sports', 'seminar', 'other'];
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-100 rounded-full"><AlertTriangle className="h-7 w-7 text-red-600" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Delete this event?</h3><p className="text-sm text-slate-500 mt-1">This cannot be undone.</p></div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-2 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2"><div className="h-5 w-20 bg-slate-200 rounded-full" /></div>
        <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
        <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── LIST PAGE ─────────────────────────────────────────────────────
export function EventsList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async (type) => {
    setLoading(true); setError('');
    try { setEvents(await eventsAPI.getEvents({ event_type: type })); }
    catch { setError('Failed to load events.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(filter); }, [filter, fetchData]);

  const isUpcoming = (d) => d && new Date(d) >= new Date();
  const TYPE_ACCENT = { technical: 'bg-blue-500', cultural: 'bg-pink-500', sports: 'bg-emerald-500', seminar: 'bg-amber-500', other: 'bg-slate-400' };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Calendar className="h-4 w-4" /></div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          </div>
          <p className="text-sm text-slate-500">Technical, cultural &amp; sports events</p>
        </div>
        {user && (
          <Link to="/events/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
            <Plus className="h-4 w-4" /> Post Event
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${!filter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>All</button>
        {EVENT_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      {error && <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center"><p className="text-sm text-red-600 mb-3">{error}</p><button onClick={() => fetchData(filter)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl"><RefreshCw className="h-4 w-4" /> Retry</button></div>}
      {loading && !error && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => {
            const meta = TYPE_META[event.event_type] || TYPE_META.other;
            const accent = TYPE_ACCENT[event.event_type] || 'bg-slate-400';
            const upcoming = isUpcoming(event.event_date);
            return (
              <Link key={event.id} to={`/events/${event.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all overflow-hidden flex flex-col">
                <div className={`h-1.5 ${accent}`} />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                    {event.event_date && (
                      <span className={`text-xs font-semibold ${upcoming ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {upcoming ? '🟢 Upcoming' : '⚪ Past'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2">{event.title}</h3>
                  {event.venue && <div className="flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" />{event.venue}</div>}
                  {event.event_date && <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Calendar className="h-3.5 w-3.5" />{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{event.event_time && <><Clock className="h-3.5 w-3.5 ml-1" />{event.event_time.slice(0, 5)}</>}</div>}
                  <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">{event.user?.name?.charAt(0)}</div>
                    <span className="text-xs text-slate-400">{event.user?.name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Calendar className="h-8 w-8 text-slate-300" /></div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No events yet</h3>
          <p className="text-sm max-w-xs">Know of an upcoming event? Share it with your campus!</p>
          {user && <Link to="/events/create" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"><Plus className="h-4 w-4" /> Post first event</Link>}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL PAGE ───────────────────────────────────────────────────
export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    eventsAPI.getEvent(id).then(setEvent).catch(() => setError('Event not found.')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await eventsAPI.deleteEvent(id); navigate('/events', { replace: true }); }
    catch { setDeleteLoading(false); setShowDelete(false); }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="max-w-2xl mx-auto py-20 text-center"><p className="text-slate-500 mb-4">{error}</p><Link to="/events" className="text-indigo-600 font-semibold text-sm hover:underline">← Back</Link></div>;

  const meta = TYPE_META[event.event_type] || TYPE_META.other;
  const canManage = user && (event.user_id === user.id || user.is_admin);

  return (
    <>
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex items-center gap-2">
            <SaveButton module="events" postId={id} />
            {canManage && (
              <>
                <Link to={`/events/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"><Edit className="h-4 w-4" /> Edit</Link>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /> Delete</button>
              </>
            )}
          </div>
        </div>

        {event.poster_url && <img src={event.poster_url} alt="Event poster" className="w-full rounded-2xl object-cover max-h-80 shadow-lg" />}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>

          <div className="grid grid-cols-2 gap-3">
            {event.venue && <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 font-medium">Venue</p><div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mt-1"><MapPin className="h-4 w-4 text-slate-400" />{event.venue}</div></div>}
            {event.event_date && <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 font-medium">Date</p><div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mt-1"><Calendar className="h-4 w-4 text-slate-400" />{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>}
            {event.event_time && <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 font-medium">Time</p><div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mt-1"><Clock className="h-4 w-4 text-slate-400" />{event.event_time.slice(0, 5)}</div></div>}
          </div>

          <div className="h-px bg-slate-100" />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>

          {event.registration_link && (
            <a href={event.registration_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
              Register Now <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">{event.user?.name?.charAt(0)}</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{event.user?.name}</p>
            <p className="text-xs text-slate-400">Posted on {new Date(event.created_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CREATE PAGE ───────────────────────────────────────────────────
export function EventCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', event_type: 'technical', description: '', venue: '', event_date: '', event_time: '', registration_link: '', poster_url: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, event_date: form.event_date || null, event_time: form.event_time || null, venue: form.venue || null, registration_link: form.registration_link || null, poster_url: form.poster_url || null };
      const created = await eventsAPI.createEvent(payload);
      navigate(`/events/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post event.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Calendar className="h-4 w-4" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Post an Event</h1><p className="text-sm text-slate-500">Share campus events with students</p></div>
      </div>

      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Event Type *</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => set('event_type', t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${form.event_type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
          <input type="text" placeholder="e.g. Annual Hackathon 2026" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
            <input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</label>
            <input type="time" value={form.event_time} onChange={(e) => set('event_time', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue</label>
          <input type="text" placeholder="e.g. Seminar Hall, Block B" value={form.venue} onChange={(e) => set('venue', e.target.value)} className={inputCls} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
          <textarea rows={4} placeholder="Describe the event, activities, prizes, etc." value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registration Link</label>
            <input type="url" placeholder="https://..." value={form.registration_link} onChange={(e) => set('registration_link', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Poster URL</label>
            <input type="url" placeholder="https://..." value={form.poster_url} onChange={(e) => set('poster_url', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</> : <><Check className="h-4 w-4" /> Post Event</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EDIT PAGE ─────────────────────────────────────────────────────
const inputClsEvEdit = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';
const EVENT_TYPES_EDIT = ['technical', 'cultural', 'sports', 'seminar', 'other'];

export function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    eventsAPI.getEvent(id).then((data) => {
      if (data.user_id !== user?.id && !user?.is_admin) { navigate('/events', { replace: true }); return; }
      setForm({ title: data.title ?? '', event_type: data.event_type ?? 'technical', description: data.description ?? '', venue: data.venue ?? '', event_date: data.event_date ?? '', event_time: data.event_time?.slice(0, 5) ?? '', registration_link: data.registration_link ?? '', poster_url: data.poster_url ?? '', is_active: data.is_active ?? true });
    }).catch(() => setError('Failed to load.')).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description required.'); return; }
    setSubmitting(true); setError('');
    try {
      await eventsAPI.updateEvent(id, { ...form, event_date: form.event_date || null, event_time: form.event_time || null, venue: form.venue || null, registration_link: form.registration_link || null, poster_url: form.poster_url || null });
      navigate(`/events/${id}`);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update.'); setSubmitting(false); }
  };

  if (loading) return <div className="max-w-xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (!form) return <div className="max-w-xl mx-auto py-20 text-center text-slate-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Calendar className="h-4 w-4" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Edit Event</h1><p className="text-sm text-slate-500">Update event details</p></div>
      </div>
      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Event Type</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES_EDIT.map((t) => (
              <button key={t} type="button" onClick={() => set('event_type', t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${form.event_type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label><input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClsEvEdit} required /></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label><input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} className={inputClsEvEdit} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</label><input type="time" value={form.event_time} onChange={(e) => set('event_time', e.target.value)} className={inputClsEvEdit} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue</label><input type="text" value={form.venue} onChange={(e) => set('venue', e.target.value)} className={inputClsEvEdit} /></div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClsEvEdit} resize-none`} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registration Link</label><input type="url" value={form.registration_link} onChange={(e) => set('registration_link', e.target.value)} className={inputClsEvEdit} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Poster URL</label><input type="url" value={form.poster_url} onChange={(e) => set('poster_url', e.target.value)} className={inputClsEvEdit} /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
