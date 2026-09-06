import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, Plus, MapPin, Clock, ExternalLink, ArrowLeft,
  Edit, Trash2, AlertTriangle, Loader2, AlertCircle,
  RefreshCw, Check, Shield,
} from 'lucide-react';
import { eventsAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';

const TYPE_META = {
  technical: { label: 'Technical' },
  cultural: { label: 'Cultural' },
  sports: { label: 'Sports' },
  seminar: { label: 'Seminar' },
  other: { label: 'Other' },
};

const EVENT_TYPES = ['technical', 'cultural', 'sports', 'seminar', 'other'];

const inputCls =
  'w-full px-3 py-2 bg-[#111113] border border-[#26262B] focus:border-[#F5A623] rounded-md text-xs text-[#F2F2F3] placeholder-[#55555C] focus:outline-none transition-colors';

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#17171A] border border-[#26262B] rounded-md shadow-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 rounded-md border border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-base">Delete this event?</h3>
            <p className="text-xs text-[#8A8A93] mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border border-[#26262B] bg-[#111113] hover:bg-[#1E1E22] text-xs font-medium text-[#D4D4D8] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2 bg-[#F87171] hover:bg-[#ef4444] text-[#0A0A0B] rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-20 bg-[#1E1E22] rounded-sm" />
        <div className="h-5 w-16 bg-[#17171A] rounded-sm" />
      </div>
      <div className="h-5 w-3/4 bg-[#1E1E22] rounded-sm" />
      <div className="h-4 w-1/2 bg-[#17171A] rounded-sm" />
      <div className="h-10 bg-[#17171A] rounded-sm" />
      <div className="flex gap-2 pt-2 border-t border-[#1F1F24]">
        <div className="h-5 w-5 bg-[#1E1E22] rounded-full" />
        <div className="h-4 w-24 bg-[#17171A] rounded-sm" />
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
    setLoading(true);
    setError('');
    try {
      setEvents(await eventsAPI.getEvents({ event_type: type }));
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filter);
  }, [filter, fetchData]);

  const isUpcoming = (d) => d && new Date(d) >= new Date();

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26262B]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Calendar className="h-5 w-5 text-[#F5A623] shrink-0" />
            <h1 className="text-2xl font-semibold text-[#F2F2F3] tracking-tight">Events</h1>
          </div>
          <p className="text-xs text-[#8A8A93]">Technical, cultural, sports &amp; campus activities</p>
        </div>
        {user && (
          <Link
            to="/events/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors shadow-none"
          >
            <Plus className="h-4 w-4" /> Post Event
          </Link>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
            !filter
              ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
              : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
          }`}
        >
          All
        </button>
        {EVENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
              filter === t
                ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
            }`}
          >
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-center">
          <p className="text-xs text-[#F87171] mb-2">{error}</p>
          <button
            onClick={() => fetchData(filter)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#111113] hover:bg-[#17171A] text-[#F2F2F3] text-xs font-medium rounded-md transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const meta = TYPE_META[event.event_type] || TYPE_META.other;
            const upcoming = isUpcoming(event.event_date);
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] transition-colors p-4 flex flex-col gap-3"
              >
                {event.poster_url && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-[#26262B] bg-[#0E0E10]">
                    <img
                      src={event.poster_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border border-[#94A3B8]/30 bg-[#94A3B8]/10 text-[#94A3B8]">
                    {meta.label}
                  </span>
                  {event.event_date && (
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border ${
                        upcoming
                          ? 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
                          : 'border-[#26262B] bg-[#17171A] text-[#8A8A93]'
                      }`}
                    >
                      {upcoming ? 'Upcoming' : 'Past'}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#F2F2F3] group-hover:text-[#F5A623] transition-colors line-clamp-1 text-sm">
                    {event.title}
                  </h3>
                  <p className="text-xs text-[#8A8A93] line-clamp-2 leading-relaxed mt-1">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-[#8A8A93] font-mono">
                  {event.venue && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  )}
                  {event.event_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {event.event_time && <> · {event.event_time.slice(0, 5)}</>}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-[#1F1F24] flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#D4D4D8] text-[10px] font-bold">
                    {event.user?.name?.charAt(0)}
                  </div>
                  <span className="text-xs text-[#8A8A93] truncate">{event.user?.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-md border border-[#26262B] bg-[#111113] flex items-center justify-center mb-3 text-[#55555C]">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F3] mb-1">No events yet</h3>
          <p className="text-xs text-[#8A8A93] max-w-xs">
            Know of an upcoming campus event? Share it with the community!
          </p>
          {user && (
            <Link
              to="/events/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Post First Event
            </Link>
          )}
        </div>
      )}

      {!user && !loading && events.length > 0 && (
        <div className="p-3.5 bg-[#17171A] border border-[#F5A623]/30 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#F5A623] shrink-0" />
            <p className="text-xs text-[#8B8B92]">
              Log in with your college email to post campus events and register.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 px-3 py-1.5 border border-[#26262B] bg-[#111113] hover:bg-[#1E1E22] hover:border-[#38383F] text-[#F2F2F3] text-xs font-medium rounded-md transition"
          >
            Log In →
          </Link>
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
    eventsAPI.getEvent(id)
      .then(setEvent)
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventsAPI.deleteEvent(id);
      navigate('/events', { replace: true });
    } catch {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-xs text-[#8A8A93] mb-3">{error}</p>
        <Link to="/events" className="text-xs text-[#F5A623] hover:underline font-medium">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const meta = TYPE_META[event.event_type] || TYPE_META.other;
  const canManage = user && (event.user_id === user.id || user.is_admin);
  const upcoming = event.event_date && new Date(event.event_date) >= new Date();

  return (
    <>
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-[#8A8A93] hover:text-[#F2F2F3] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SaveButton module="events" postId={id} />
            {canManage && (
              <>
                <Link
                  to={`/events/${id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#17171A] hover:border-[#38383F] text-xs font-medium text-[#D4D4D8] rounded-md transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F87171]/40 bg-[#F87171]/10 hover:bg-[#F87171]/20 text-xs font-medium text-[#F87171] rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {event.poster_url && (
          <div className="rounded-md overflow-hidden border border-[#26262B] bg-[#0E0E10] max-h-80">
            <img src={event.poster_url} alt="Event poster" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border border-[#94A3B8]/30 bg-[#94A3B8]/10 text-[#94A3B8]">
              {meta.label}
            </span>
            {event.event_date && (
              <span
                className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border ${
                  upcoming
                    ? 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8A8A93]'
                }`}
              >
                {upcoming ? 'Upcoming' : 'Past'}
              </span>
            )}
          </div>

          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">{event.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {event.venue && (
              <div className="bg-[#17171A] border border-[#26262B] rounded-md p-3">
                <p className="text-[11px] font-mono text-[#8A8A93] uppercase tracking-wider">Venue</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#F2F2F3] mt-1 truncate">
                  <MapPin className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>
            )}
            {event.event_date && (
              <div className="bg-[#17171A] border border-[#26262B] rounded-md p-3">
                <p className="text-[11px] font-mono text-[#8A8A93] uppercase tracking-wider">Date</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#F2F2F3] mt-1">
                  <Calendar className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            )}
            {event.event_time && (
              <div className="bg-[#17171A] border border-[#26262B] rounded-md p-3">
                <p className="text-[11px] font-mono text-[#8A8A93] uppercase tracking-wider">Time</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#F2F2F3] mt-1">
                  <Clock className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                  <span>{event.event_time.slice(0, 5)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[#1F1F24]" />
          <p className="text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">{event.description}</p>

          {event.registration_link && (
            <div className="pt-2">
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
              >
                Register Now <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] font-semibold text-sm">
            {event.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#F2F2F3] text-xs">{event.user?.name}</p>
            <p className="text-[11px] text-[#8A8A93] font-mono">
              Posted on {new Date(event.created_at).toLocaleDateString('en-IN')}
            </p>
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
  const [form, setForm] = useState({
    title: '',
    event_type: 'technical',
    description: '',
    venue: '',
    event_date: '',
    event_time: '',
    registration_link: '',
    poster_url: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        event_date: form.event_date || null,
        event_time: form.event_time || null,
        venue: form.venue || null,
        registration_link: form.registration_link || null,
        poster_url: form.poster_url || null,
      };
      const created = await eventsAPI.createEvent(payload);
      navigate(`/events/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post event.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Calendar className="h-5 w-5 text-[#F5A623] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Post an Event</h1>
          <p className="text-xs text-[#8A8A93]">Share campus events with students</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Event Type *</label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('event_type', t)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                  form.event_type === t
                    ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
                }`}
              >
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            placeholder="e.g. Annual Campus Hackathon 2026"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => set('event_date', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => set('event_time', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Venue</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
            <input
              type="text"
              placeholder="e.g. Seminar Hall, Block B"
              value={form.venue}
              onChange={(e) => set('venue', e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={4}
            placeholder="Describe the event, agenda, activities, prizes, etc."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Registration Link</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.registration_link}
              onChange={(e) => set('registration_link', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Poster Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.poster_url}
              onChange={(e) => set('poster_url', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#D4D4D8] rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Post Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EDIT PAGE ─────────────────────────────────────────────────────
export function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    eventsAPI.getEvent(id)
      .then((data) => {
        if (data.user_id !== user?.id && !user?.is_admin) {
          navigate('/events', { replace: true });
          return;
        }
        setForm({
          title: data.title ?? '',
          event_type: data.event_type ?? 'technical',
          description: data.description ?? '',
          venue: data.venue ?? '',
          event_date: data.event_date ?? '',
          event_time: data.event_time?.slice(0, 5) ?? '',
          registration_link: data.registration_link ?? '',
          poster_url: data.poster_url ?? '',
          is_active: data.is_active ?? true,
        });
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await eventsAPI.updateEvent(id, {
        ...form,
        event_date: form.event_date || null,
        event_time: form.event_time || null,
        venue: form.venue || null,
        registration_link: form.registration_link || null,
        poster_url: form.poster_url || null,
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-xs text-[#8A8A93]">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Calendar className="h-5 w-5 text-[#F5A623] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Edit Event</h1>
          <p className="text-xs text-[#8A8A93]">Update event details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Event Type</label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('event_type', t)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                  form.event_type === t
                    ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
                }`}
              >
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => set('event_date', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => set('event_time', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Venue</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="text"
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Registration Link</label>
            <input
              type="url"
              value={form.registration_link}
              onChange={(e) => set('registration_link', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Poster Image URL</label>
            <input
              type="url"
              value={form.poster_url}
              onChange={(e) => set('poster_url', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#D4D4D8] rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
