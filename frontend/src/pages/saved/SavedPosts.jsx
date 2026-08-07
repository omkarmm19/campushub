import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, Home, ShoppingBag, Search, Briefcase, Calendar,
  ChevronRight, Loader2, RefreshCw, Trash2, AlertTriangle,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { housingAPI } from '../../api/housingAPI';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { lostFoundAPI, opportunitiesAPI, eventsAPI } from '../../api/communityAPI';

// ─── Saved posts API ───────────────────────────────────────────────
const savedAPI = {
  getSaved: (module) => api.get(`/saved${module ? `?module=${module}` : ''}`).then((r) => r.data),
  unsave: (module, postId) => api.delete(`/saved/${module}/${postId}`),
};

const MODULE_META = {
  housing: { label: 'Housing', Icon: Home, color: 'text-blue-600', bg: 'bg-blue-100', path: '/housing' },
  marketplace: { label: 'Marketplace', Icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/marketplace' },
  lostfound: { label: 'Lost & Found', Icon: Search, color: 'text-amber-600', bg: 'bg-amber-100', path: '/lost-found' },
  opportunities: { label: 'Opportunities', Icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100', path: '/opportunities' },
  events: { label: 'Events', Icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-100', path: '/events' },
};

const MODULE_FETCHERS = {
  housing: (id) => housingAPI.getListing(id),
  marketplace: (id) => marketplaceAPI.getItem(id),
  lostfound: (id) => lostFoundAPI.getPost(id),
  opportunities: (id) => opportunitiesAPI.getOpportunity(id),
  events: (id) => eventsAPI.getEvent(id),
};

function UnsaveConfirm({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-amber-100 rounded-full"><AlertTriangle className="h-7 w-7 text-amber-600" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Remove from saved?</h3><p className="text-sm text-slate-500 mt-1">You can always save it again.</p></div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedCard({ saved, detail, onUnsave }) {
  const meta = MODULE_META[saved.module];
  if (!meta || !detail) return null;
  const { Icon, color, bg, path } = meta;

  const title = detail.title || '—';
  const sub = detail.location || detail.category || detail.opp_type || detail.event_type || detail.post_type || '';
  const date = new Date(saved.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex items-center gap-4 p-4">
      <Link to={`${path}/${saved.post_id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`${bg} ${color} p-3 rounded-xl shrink-0`}><Icon className="h-5 w-5" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 capitalize">{meta.label}</span>
            {sub && <><span className="text-slate-200">·</span><span className="text-xs text-slate-400 capitalize">{sub}</span></>}
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">Saved {date}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition shrink-0" />
      </Link>
      <button
        onClick={() => onUnsave(saved.module, saved.post_id)}
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
        title="Remove from saved"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 p-4 animate-pulse">
      <div className="h-11 w-11 bg-slate-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-slate-200 rounded-lg" />
        <div className="h-3 w-1/2 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function SavedPosts() {
  const [savedRecords, setSavedRecords] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [confirm, setConfirm] = useState(null); // { module, postId }

  const fetchSaved = useCallback(async (mod) => {
    setLoading(true); setError('');
    try {
      const records = await savedAPI.getSaved(mod);
      setSavedRecords(records);

      // Fetch post details for all saved records in parallel
      const detailEntries = await Promise.allSettled(
        records.map(async (r) => {
          const fetcher = MODULE_FETCHERS[r.module];
          if (!fetcher) return [null, null];
          try {
            const data = await fetcher(r.post_id);
            return [`${r.module}-${r.post_id}`, data];
          } catch {
            return [null, null];
          }
        })
      );
      const detailMap = {};
      detailEntries.forEach((result) => {
        if (result.status === 'fulfilled' && result.value[0]) {
          detailMap[result.value[0]] = result.value[1];
        }
      });
      setDetails(detailMap);
    } catch {
      setError('Failed to load saved posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(activeFilter); }, [activeFilter, fetchSaved]);

  const handleUnsave = async (module, postId) => {
    await savedAPI.unsave(module, postId);
    setSavedRecords((prev) => prev.filter((r) => !(r.module === module && r.post_id === postId)));
    setConfirm(null);
  };

  return (
    <>
      {confirm && (
        <UnsaveConfirm
          onConfirm={() => handleUnsave(confirm.module, confirm.postId)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-slate-900 text-white rounded-lg"><Bookmark className="h-4 w-4" /></div>
              <h1 className="text-2xl font-bold text-slate-900">Saved Posts</h1>
            </div>
            <p className="text-sm text-slate-500">Your bookmarked listings</p>
          </div>
          <button onClick={() => fetchSaved(activeFilter)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Module filter chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${!activeFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>All</button>
          {Object.entries(MODULE_META).map(([key, { label, Icon }]) => (
            <button key={key} onClick={() => setActiveFilter(activeFilter === key ? '' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${activeFilter === key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={() => fetchSaved(activeFilter)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</div>}

        {/* List */}
        {!loading && !error && savedRecords.length > 0 && (
          <div className="space-y-3">
            {savedRecords.map((saved) => (
              <SavedCard
                key={`${saved.module}-${saved.post_id}`}
                saved={saved}
                detail={details[`${saved.module}-${saved.post_id}`]}
                onUnsave={(mod, postId) => setConfirm({ module: mod, postId })}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && savedRecords.length === 0 && (
          <div className="py-20 flex flex-col items-center text-center text-slate-400">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              {activeFilter ? `No saved ${MODULE_META[activeFilter]?.label} posts` : 'Nothing saved yet'}
            </h3>
            <p className="text-sm max-w-xs">Tap the bookmark icon on any listing to save it here for quick access.</p>
          </div>
        )}
      </div>
    </>
  );
}
