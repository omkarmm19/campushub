import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Home, ShoppingBag, Search, Briefcase, Calendar,
  ChevronRight, Loader2, RefreshCw, User, MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { housingAPI } from '../../api/housingAPI';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { lostFoundAPI, opportunitiesAPI, eventsAPI } from '../../api/communityAPI';

const MODULE_ICONS = {
  housing: { Icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-100', path: '/housing' },
  marketplace: { Icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/marketplace' },
  lostfound: { Icon: Search, color: 'text-amber-600', bg: 'bg-amber-100', path: '/lost-found' },
  opportunities: { Icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100', path: '/opportunities' },
  events: { Icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-100', path: '/events' },
};

function StatCard({ label, value, icon: Icon, bg, color, path }) {
  return (
    <Link to={path} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all p-5 flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl`}><Icon className="h-5 w-5" /></div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition" />
    </Link>
  );
}

function PostPreviewCard({ item, type }) {
  const pathMap = { housing: '/housing', marketplace: '/marketplace', lostfound: '/lost-found', opportunities: '/opportunities', events: '/events' };
  const meta = MODULE_ICONS[type];
  const { Icon } = meta;

  const title = item.title || item.title;
  const sub = item.location || item.category || item.opp_type || item.event_type || item.post_type || '';
  const date = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Link to={`${pathMap[type]}/${item.id}`}
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
      <div className={`${meta.bg} ${meta.color} p-2 rounded-lg shrink-0`}><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">{title}</p>
        <p className="text-xs text-slate-400 capitalize">{sub} · {date}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition shrink-0 mt-0.5" />
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

  const loadDashboard = async () => {
    setLoading(true); setError('');
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
  };

  useEffect(() => { loadDashboard(); }, [user]);

  const allMyPosts = [
    ...data.myHousing.map((h) => ({ ...h, _type: 'housing' })),
    ...data.myMarketplace.map((m) => ({ ...m, _type: 'marketplace' })),
    ...data.myLostFound.map((p) => ({ ...p, _type: 'lostfound' })),
    ...data.myOpportunities.map((o) => ({ ...o, _type: 'opportunities' })),
    ...data.myEvents.map((e) => ({ ...e, _type: 'events' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPosts = allMyPosts.length;

  return (
    <div className="space-y-8 py-4">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><LayoutDashboard className="h-4 w-4" /></div>
              <span className="text-indigo-200 text-sm font-medium">My Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-indigo-200 text-sm">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-indigo-100">
              {user?.block_number && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Block {user.block_number}</span>}
              {user?.room_number && <span>Room {user.room_number}</span>}
            </div>
          </div>
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
      ) : error ? (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button onClick={loadDashboard} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3">My Activity</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Housing Listings', value: data.myHousing.length, type: 'housing' },
                { label: 'Marketplace Items', value: data.myMarketplace.length, type: 'marketplace' },
                { label: 'Lost & Found Posts', value: data.myLostFound.length, type: 'lostfound' },
                { label: 'Opportunities', value: data.myOpportunities.length, type: 'opportunities' },
                { label: 'Events Posted', value: data.myEvents.length, type: 'events' },
              ].map(({ label, value, type }) => {
                const { Icon, color, bg, path } = MODULE_ICONS[type];
                return <StatCard key={type} label={label} value={value} icon={Icon} bg={bg} color={color} path={path} />;
              })}
            </div>
          </div>

          {/* My Recent Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">My Recent Posts</h2>
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-semibold">{totalPosts} total</span>
              </div>
              {allMyPosts.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No posts yet. Start contributing!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allMyPosts.slice(0, 8).map((post) => (
                    <PostPreviewCard key={`${post._type}-${post.id}`} item={post} type={post._type} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Find Housing', sub: 'Browse listings', path: '/housing', type: 'housing' },
                  { label: 'Post a Room', sub: 'List your room', path: '/housing/create', type: 'housing' },
                  { label: 'Buy / Sell', sub: 'Student marketplace', path: '/marketplace', type: 'marketplace' },
                  { label: 'Lost & Found', sub: 'Report an item', path: '/lost-found/create', type: 'lostfound' },
                  { label: 'Opportunities', sub: 'Internships & more', path: '/opportunities', type: 'opportunities' },
                  { label: 'Events', sub: 'What\'s happening', path: '/events', type: 'events' },
                ].map(({ label, sub, path, type }) => {
                  const { Icon, color, bg } = MODULE_ICONS[type];
                  return (
                    <Link key={path} to={path}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition">
                      <div className={`${bg} ${color} p-2 rounded-lg`}><Icon className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">{label}</p>
                        <p className="text-xs text-slate-400">{sub}</p>
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
