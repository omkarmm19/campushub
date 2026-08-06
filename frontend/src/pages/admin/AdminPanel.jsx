import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Shield, Users, Home, ShoppingBag, Search, Briefcase,
  Calendar, BarChart3, Trash2, AlertTriangle, Loader2,
  RefreshCw, ChevronRight, CheckCircle, XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

// ─── Admin API helpers ─────────────────────────────────────────────
const adminAPI = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  toggleAdmin: (id) => api.put(`/admin/users/${id}/toggle-admin`).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getModule: (mod) => api.get(`/admin/${mod}`).then((r) => r.data),
  deleteItem: (mod, id) => api.delete(`/admin/${mod}/${id}`),
};

// ─── Shared: Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Delete confirm dialog ─────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-100 rounded-full"><AlertTriangle className="h-7 w-7 text-red-600" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Delete this?</h3><p className="text-sm text-slate-500 mt-1">&ldquo;{label}&rdquo; will be permanently removed.</p></div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={async () => { setLoading(true); await onConfirm(); }} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────
function UsersTab({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { id, name }

  const load = async () => { setLoading(true); setUsers(await adminAPI.getUsers()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleToggleAdmin = async (id) => {
    const updated = await adminAPI.toggleAdmin(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const handleDelete = async (id) => {
    await adminAPI.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirm(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>;

  return (
    <>
      {confirm && <ConfirmDelete label={confirm.name} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">All Users <span className="text-slate-400 font-medium text-sm">({users.length})</span></h2>
          <button onClick={load} className="text-slate-400 hover:text-slate-600 transition"><RefreshCw className="h-4 w-4" /></button>
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">{u.name?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  {u.is_admin && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Admin</span>}
                </div>
                <p className="text-xs text-slate-400 truncate">{u.email} · Block {u.block_number} / Room {u.room_number}</p>
              </div>
              {u.id !== currentUserId && (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggleAdmin(u.id)} title={u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    className={`p-1.5 rounded-lg border transition ${u.is_admin ? 'border-indigo-200 text-indigo-600 hover:bg-indigo-50' : 'border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'}`}>
                    <Shield className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirm({ id: u.id, name: u.name })}
                    className="p-1.5 rounded-lg border border-slate-200 text-red-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Content Tab (generic) ─────────────────────────────────────────
function ContentTab({ moduleKey, label, titleKey = 'title' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = async () => { setLoading(true); setItems(await adminAPI.getModule(moduleKey)); setLoading(false); };
  useEffect(() => { load(); }, [moduleKey]);

  const handleDelete = async (id) => {
    await adminAPI.deleteItem(moduleKey, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirm(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>;

  return (
    <>
      {confirm && <ConfirmDelete label={confirm.title} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">{label} <span className="text-slate-400 font-medium text-sm">({items.length})</span></h2>
          <button onClick={load} className="text-slate-400 hover:text-slate-600 transition"><RefreshCw className="h-4 w-4" /></button>
        </div>
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No {label.toLowerCase()} found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item[titleKey]}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400 truncate">by {item.user?.name}</p>
                    <span className="text-slate-200">·</span>
                    <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('en-IN')}</p>
                    {item.is_active === false && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">Inactive</span>}
                    {item.is_sold && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">Sold</span>}
                    {item.is_resolved && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">Resolved</span>}
                  </div>
                </div>
                <button onClick={() => setConfirm({ id: item.id, title: item[titleKey] })}
                  className="p-1.5 rounded-lg border border-slate-200 text-red-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── MAIN ADMIN PANEL ──────────────────────────────────────────────
const TABS = [
  { key: 'overview', label: 'Overview', Icon: BarChart3 },
  { key: 'users', label: 'Users', Icon: Users },
  { key: 'housing', label: 'Housing', Icon: Home },
  { key: 'marketplace', label: 'Marketplace', Icon: ShoppingBag },
  { key: 'lost-found', label: 'Lost & Found', Icon: Search },
  { key: 'opportunities', label: 'Opportunities', Icon: Briefcase },
  { key: 'events', label: 'Events', Icon: Calendar },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((s) => { setStats(s); setStatsLoading(false); }).catch(() => setStatsLoading(false));
  }, []);

  if (!user?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-white rounded-xl"><Shield className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage users and platform content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-slate-100 p-1.5 rounded-2xl w-fit">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold transition ${activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total Users" value={stats.total_users} Icon={Users} color="text-indigo-600" bg="bg-indigo-100" />
                <StatCard label="Housing" value={stats.total_housing} Icon={Home} color="text-blue-600" bg="bg-blue-100" />
                <StatCard label="Marketplace" value={stats.total_marketplace} Icon={ShoppingBag} color="text-emerald-600" bg="bg-emerald-100" />
                <StatCard label="Lost & Found" value={stats.total_lostfound} Icon={Search} color="text-amber-600" bg="bg-amber-100" />
                <StatCard label="Opportunities" value={stats.total_opportunities} Icon={Briefcase} color="text-purple-600" bg="bg-purple-100" />
                <StatCard label="Events" value={stats.total_events} Icon={Calendar} color="text-rose-600" bg="bg-rose-100" />
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                <h2 className="font-bold text-lg mb-2">Platform Health</h2>
                <p className="text-slate-400 text-sm">All systems operational. Navigate to individual tabs to manage content and users.</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-semibold">CampusHub is live</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-red-500 text-sm">Failed to load stats.</p>
          )}
        </div>
      )}

      {activeTab === 'users' && <UsersTab currentUserId={user?.id} />}
      {activeTab === 'housing' && <ContentTab moduleKey="housing" label="Housing Listings" />}
      {activeTab === 'marketplace' && <ContentTab moduleKey="marketplace" label="Marketplace Items" />}
      {activeTab === 'lost-found' && <ContentTab moduleKey="lost-found" label="Lost & Found Posts" />}
      {activeTab === 'opportunities' && <ContentTab moduleKey="opportunities" label="Opportunities" />}
      {activeTab === 'events' && <ContentTab moduleKey="events" label="Events" />}
    </div>
  );
}
