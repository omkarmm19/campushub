import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, ShoppingBag, Search, Briefcase, Calendar,
  ChevronRight, Loader2, RefreshCw, User, MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { housingAPI } from '../../api/housingAPI';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { lostFoundAPI, opportunitiesAPI, eventsAPI } from '../../api/communityAPI';

const MODULE_META = {
  housing: { Icon: Home, path: '/housing' },
  marketplace: { Icon: ShoppingBag, path: '/marketplace' },
  lostfound: { Icon: Search, path: '/lost-found' },
  opportunities: { Icon: Briefcase, path: '/opportunities' },
  events: { Icon: Calendar, path: '/events' },
};

function StatCard({ label, value, icon: Icon, path }) {
  return (
    <Link
      to={path}
      className="group bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] transition-colors p-4 flex items-center justify-between"
    >
      <div className="space-y-1">
        <p className="text-2xl font-mono font-semibold text-[#F2F2F3] tracking-tight">{value}</p>
        <p className="text-xs text-[#8A8A93] font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#8A8A93] group-hover:text-[#22D3EE] transition-colors" />
        <ChevronRight className="h-4 w-4 text-[#55555C] group-hover:text-[#F2F2F3] transition-colors" />
      </div>
    </Link>
  );
}

function PostPreviewCard({ item, type }) {
  const pathMap = {
    housing: '/housing',
    marketplace: '/marketplace',
    lostfound: '/lost-found',
    opportunities: '/opportunities',
    events: '/events',
  };
  const { Icon } = MODULE_META[type] || { Icon: FileText };

  const title = item.title || (item.sharing_type ? `${item.sharing_type.charAt(0).toUpperCase() + item.sharing_type.slice(1)} Sharing (${item.location || 'Campus'})` : item.location) || 'Post';
  const sub = item.location || item.category || item.opp_type || item.event_type || item.post_type || '';
  const date = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Link
      to={`${pathMap[type]}/${item.id}`}
      className="group flex items-center justify-between p-2.5 rounded-md hover:bg-[#17171A] border border-transparent hover:border-[#26262B] transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-sm bg-[#17171A] border border-[#26262B] text-[#8A8A93] group-hover:text-[#22D3EE] shrink-0 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#F2F2F3] group-hover:text-[#22D3EE] transition-colors truncate">
            {title}
          </p>
          <p className="text-[11px] font-mono text-[#8A8A93] capitalize mt-0.5 truncate">
            {sub} · {date}
          </p>
        </div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-[#55555C] group-hover:text-[#F2F2F3] transition-colors shrink-0 ml-2" />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    myHousing: [],
    myMarketplace: [],
    myLostFound: [],
    myOpportunities: [],
    myEvents: [],
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allHousing, allMarket, allLF, allOpps, allEvents] = await Promise.all([
        housingAPI.getListings(),
        marketplaceAPI.getItems(),
        lostFoundAPI.getPosts(),
        opportunitiesAPI.getOpportunities(),
        eventsAPI.getEvents(),
      ]);

      setData({
        myHousing: allHousing.filter((h) => h.user_id === user?.id),
        myMarketplace: allMarket.filter((m) => m.user_id === user?.id),
        myLostFound: allLF.filter((p) => p.user_id === user?.id),
        myOpportunities: allOpps.filter((o) => o.user_id === user?.id),
        myEvents: allEvents.filter((e) => e.user_id === user?.id),
      });
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const allMyPosts = [
    ...data.myHousing.map((h) => ({ ...h, _type: 'housing' })),
    ...data.myMarketplace.map((m) => ({ ...m, _type: 'marketplace' })),
    ...data.myLostFound.map((p) => ({ ...p, _type: 'lostfound' })),
    ...data.myOpportunities.map((o) => ({ ...o, _type: 'opportunities' })),
    ...data.myEvents.map((e) => ({ ...e, _type: 'events' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPosts = allMyPosts.length;

  return (
    <div className="space-y-6 py-4">
      {/* Header Profile Summary */}
      <div className="bg-[#111113] border border-[#26262B] rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-full bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] text-lg font-semibold shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#F2F2F3] tracking-tight">
                {user?.name}
              </h1>
              <span className="px-2 py-0.5 rounded-sm border border-[#26262B] bg-[#17171A] text-[#8A8A93] text-[10px] font-mono">
                Student
              </span>
            </div>
            <p className="text-xs text-[#8A8A93] font-mono mt-0.5">
              {user?.college_email || user?.email}
            </p>
            {(user?.block_number || user?.room_number) && (
              <div className="flex items-center gap-3 text-xs text-[#8A8A93] font-mono mt-1.5">
                {user?.block_number && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#55555C]" /> Block {user.block_number}
                  </span>
                )}
                {user?.room_number && <span>Room {user.room_number}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1F1F24]">
          <Link
            to="/profile"
            className="px-3 py-1.5 border border-[#26262B] bg-[#17171A] hover:border-[#38383F] text-xs font-medium text-[#D4D4D8] rounded-md transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            to="/housing/create"
            className="px-3 py-1.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-xs font-medium text-[#0A0A0B] rounded-md transition-colors"
          >
            Post Listing
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
        </div>
      ) : error ? (
        <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-center">
          <p className="text-xs text-[#F87171] mb-2">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#111113] hover:bg-[#17171A] text-[#F2F2F3] text-xs font-medium rounded-md transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A8A93] mb-3">
              My Activity
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Housing Listings', value: data.myHousing.length, type: 'housing' },
                { label: 'Marketplace Items', value: data.myMarketplace.length, type: 'marketplace' },
                { label: 'Lost & Found', value: data.myLostFound.length, type: 'lostfound' },
                { label: 'Opportunities', value: data.myOpportunities.length, type: 'opportunities' },
                { label: 'Events', value: data.myEvents.length, type: 'events' },
              ].map(({ label, value, type }) => {
                const { Icon, path } = MODULE_META[type];
                return <StatCard key={type} label={label} value={value} icon={Icon} path={path} />;
              })}
            </div>
          </div>

          {/* Posts & Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* My Recent Posts */}
            <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1F1F24]">
                <h2 className="text-sm font-semibold text-[#F2F2F3]">My Recent Posts</h2>
                <span className="text-xs font-mono text-[#8A8A93] border border-[#26262B] bg-[#17171A] px-2 py-0.5 rounded-sm">
                  {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
                </span>
              </div>
              {allMyPosts.length === 0 ? (
                <div className="py-10 text-center text-[#8A8A93]">
                  <User className="h-7 w-7 mx-auto mb-2 text-[#55555C]" />
                  <p className="text-xs">No posts yet. Start contributing to campus!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allMyPosts.slice(0, 7).map((post) => (
                    <PostPreviewCard key={`${post._type}-${post.id}`} item={post} type={post._type} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 flex flex-col">
              <div className="pb-3 mb-3 border-b border-[#1F1F24]">
                <h2 className="text-sm font-semibold text-[#F2F2F3]">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Find Housing', sub: 'Browse flats & rooms', path: '/housing', type: 'housing' },
                  { label: 'Post a Room', sub: 'List room or roommate', path: '/housing/create', type: 'housing' },
                  { label: 'Marketplace', sub: 'Books, gadgets, gear', path: '/marketplace', type: 'marketplace' },
                  { label: 'Sell an Item', sub: 'List student essentials', path: '/marketplace/create', type: 'marketplace' },
                  { label: 'Lost & Found', sub: 'Report lost item', path: '/lost-found/create', type: 'lostfound' },
                  { label: 'Post Opportunity', sub: 'Internship or hackathon', path: '/opportunities/create', type: 'opportunities' },
                ].map(({ label, sub, path, type }) => {
                  const { Icon } = MODULE_META[type];
                  return (
                    <Link
                      key={path}
                      to={path}
                      className="group flex items-start gap-2.5 p-3 rounded-md border border-[#26262B] hover:border-[#38383F] bg-[#17171A] hover:bg-[#1E1E22] transition-colors"
                    >
                      <Icon className="h-4 w-4 text-[#8A8A93] group-hover:text-[#22D3EE] shrink-0 mt-0.5 transition-colors" />
                      <div>
                        <p className="text-xs font-medium text-[#F2F2F3] group-hover:text-[#22D3EE] transition-colors">
                          {label}
                        </p>
                        <p className="text-[11px] text-[#8A8A93]">{sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
