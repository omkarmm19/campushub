import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, Home, ShoppingBag, Search, Briefcase, Calendar,
  ChevronRight, RefreshCw, Trash2, AlertTriangle,
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
  housing: { label: 'Housing', Icon: Home, path: '/housing' },
  marketplace: { label: 'Marketplace', Icon: ShoppingBag, path: '/marketplace' },
  lostfound: { label: 'Lost & Found', Icon: Search, path: '/lost-found' },
  opportunities: { label: 'Opportunities', Icon: Briefcase, path: '/opportunities' },
  events: { label: 'Events', Icon: Calendar, path: '/events' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#26262B] rounded-md p-5 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 bg-[#F87171]/10 border border-[#F87171]/30 rounded-full">
            <AlertTriangle className="h-5 w-5 text-[#F87171]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-sm">Remove from saved?</h3>
            <p className="text-xs text-[#8A8A93] mt-1">You can save this item again at any time.</p>
          </div>
          <div className="flex gap-2 w-full pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-1.5 border border-[#26262B] hover:border-[#38383F] rounded-md text-xs font-medium text-[#8A8A93] hover:text-[#F2F2F3] hover:bg-[#17171A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-1.5 bg-[#F87171]/15 hover:bg-[#F87171]/25 border border-[#F87171]/40 text-[#F87171] rounded-md text-xs font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedCard({ saved, detail, onUnsave }) {
  const meta = MODULE_META[saved.module];
  if (!meta || !detail) return null;
  const { Icon, path } = meta;

  const title = detail.title || (detail.sharing_type ? `${detail.sharing_type.charAt(0).toUpperCase() + detail.sharing_type.slice(1)} Sharing (${detail.location || 'Campus'})` : detail.location) || 'Post';
  const sub = detail.location || detail.category || detail.opp_type || detail.event_type || detail.post_type || '';
  const date = new Date(saved.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="group bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] transition-colors flex items-center gap-3 p-3.5">
      <Link to={`${path}/${saved.post_id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-sm bg-[#17171A] border border-[#26262B] text-[#8A8A93] group-hover:text-[#22D3EE] shrink-0 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#F2F2F3] group-hover:text-[#22D3EE] transition-colors truncate">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-[#8A8A93]">
            <span className="capitalize">{meta.label}</span>
            {sub && (
              <>
                <span className="text-[#38383F]">·</span>
                <span className="capitalize">{sub}</span>
              </>
            )}
            <span className="text-[#38383F]">·</span>
            <span>Saved {date}</span>
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#55555C] group-hover:text-[#F2F2F3] transition-colors shrink-0" />
      </Link>
      <button
        onClick={() => onUnsave(saved.module, saved.post_id)}
        className="p-1.5 text-[#55555C] hover:text-[#F87171] hover:bg-[#17171A] rounded-sm transition-colors shrink-0"
        title="Remove from saved"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-[#111113] rounded-md border border-[#26262B] flex items-center gap-3 p-3.5 animate-pulse">
      <div className="h-9 w-9 bg-[#17171A] rounded-sm shrink-0 border border-[#26262B]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 bg-[#17171A] rounded-sm" />
        <div className="h-2.5 w-1/3 bg-[#17171A] rounded-sm" />
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
    setLoading(true);
    setError('');
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

  useEffect(() => {
    fetchSaved(activeFilter);
  }, [activeFilter, fetchSaved]);

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

      <div className="max-w-2xl mx-auto space-y-5 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#26262B]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="h-5 w-5 text-[#22D3EE] shrink-0" />
            <div>
              <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Saved Posts</h1>
              <p className="text-xs text-[#8A8A93]">Your bookmarked listings across campus</p>
            </div>
          </div>
          <button
            onClick={() => fetchSaved(activeFilter)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#8A8A93] hover:text-[#F2F2F3] border border-[#26262B] hover:border-[#38383F] rounded-md transition-colors w-fit"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        {/* Module filter chips - Title Case */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFilter('')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
              !activeFilter
                ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
            }`}
          >
            All
          </button>
          {Object.entries(MODULE_META).map(([key, { label, Icon }]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(activeFilter === key ? '' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                activeFilter === key
                  ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                  : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
              }`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-center">
            <p className="text-xs text-[#F87171] mb-2">{error}</p>
            <button
              onClick={() => fetchSaved(activeFilter)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-xs font-medium rounded-md hover:bg-[#F87171]/25 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !error && savedRecords.length > 0 && (
          <div className="space-y-2">
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
          <div className="py-16 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-md bg-[#17171A] border border-[#26262B] flex items-center justify-center mb-3">
              <Bookmark className="h-5 w-5 text-[#55555C]" />
            </div>
            <h3 className="text-sm font-medium text-[#F2F2F3] mb-1">
              {activeFilter ? `No saved ${MODULE_META[activeFilter]?.label} posts` : 'Nothing saved yet'}
            </h3>
            <p className="text-xs text-[#8A8A93] max-w-xs">
              Click the bookmark icon on any listing to save it here for quick access.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
