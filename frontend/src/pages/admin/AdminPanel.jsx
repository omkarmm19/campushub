import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Shield, Users, Home, ShoppingBag, Search, Briefcase,
  Calendar, BarChart3, Trash2, AlertTriangle, Loader2,
  RefreshCw,
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

// ─── Shared: Dark Stat Card (JetBrains Mono numbers, no icon box) ──
function StatCard({ label, value, Icon }) {
  return (
    <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-2xl font-mono font-semibold text-[#F2F2F3] tracking-tight">
          {value ?? '—'}
        </p>
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">
          {label}
        </p>
      </div>
      <Icon className="h-4 w-4 text-[#8A8A93] shrink-0" />
    </div>
  );
}

// ─── Delete confirm dialog ─────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#26262B] rounded-md p-5 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 bg-[#F87171]/10 border border-[#F87171]/30 rounded-full">
            <AlertTriangle className="h-5 w-5 text-[#F87171]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-sm">Delete item?</h3>
            <p className="text-xs text-[#8A8A93] mt-1">
              &ldquo;{label}&rdquo; will be permanently removed.
            </p>
          </div>
          <div className="flex gap-2 w-full pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-1.5 border border-[#26262B] hover:border-[#38383F] rounded-md text-xs font-medium text-[#8A8A93] hover:text-[#F2F2F3] hover:bg-[#17171A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                await onConfirm();
              }}
              disabled={loading}
              className="flex-1 py-1.5 bg-[#F87171]/15 hover:bg-[#F87171]/25 border border-[#F87171]/40 text-[#F87171] rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch {
      // handled quietly
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleAdmin = async (id) => {
    const updated = await adminAPI.toggleAdmin(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const handleDelete = async (id) => {
    await adminAPI.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  return (
    <>
      {confirm && (
        <ConfirmDelete
          label={confirm.name}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="bg-[#111113] rounded-md border border-[#26262B] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#26262B] flex items-center justify-between bg-[#17171A]/40">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A8A93]">
            All Users <span className="text-[#F2F2F3]">({users.length})</span>
          </h2>
          <button
            onClick={load}
            className="text-[#8A8A93] hover:text-[#F2F2F3] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="divide-y divide-[#1F1F24]">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#17171A] transition-colors"
            >
              <div className="h-8 w-8 rounded-sm bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#22D3EE] font-mono text-xs font-semibold shrink-0">
                {u.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-[#F2F2F3] truncate">{u.name}</p>
                  {u.is_admin && (
                    <span className="px-1.5 py-0.5 bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] text-[10px] font-mono rounded-sm">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-[#8A8A93] truncate mt-0.5">
                  {u.college_email || u.email} · Block {u.block_number} / Room {u.room_number}
                </p>
              </div>
              {u.id !== currentUserId && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleAdmin(u.id)}
                    title={u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    className={`p-1.5 rounded-sm border transition-colors ${
                      u.is_admin
                        ? 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE] hover:bg-[#22D3EE]/20'
                        : 'border-[#26262B] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3] hover:bg-[#17171A]'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirm({ id: u.id, name: u.name })}
                    title="Delete User"
                    className="p-1.5 rounded-sm border border-[#26262B] hover:border-[#F87171]/40 text-[#8A8A93] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getModule(moduleKey);
      setItems(data);
    } catch {
      // handled quietly
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    await adminAPI.deleteItem(moduleKey, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  return (
    <>
      {confirm && (
        <ConfirmDelete
          label={confirm.title}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="bg-[#111113] rounded-md border border-[#26262B] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#26262B] flex items-center justify-between bg-[#17171A]/40">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A8A93]">
            {label} <span className="text-[#F2F2F3]">({items.length})</span>
          </h2>
          <button
            onClick={load}
            className="text-[#8A8A93] hover:text-[#F2F2F3] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="py-12 text-center text-[#8A8A93] text-xs font-mono">
            No {label.toLowerCase()} found.
          </div>
        ) : (
          <div className="divide-y divide-[#1F1F24]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#17171A] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#F2F2F3] truncate">
                    {item[titleKey]}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-[#8A8A93]">
                    <span className="truncate">by {item.user?.name}</span>
                    <span className="text-[#38383F]">·</span>
                    <span>{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                    {item.is_active === false && (
                      <span className="px-1.5 py-0.2 bg-[#17171A] border border-[#26262B] text-[#8A8A93] text-[10px] rounded-sm">
                        Inactive
                      </span>
                    )}
                    {item.is_sold && (
                      <span className="px-1.5 py-0.2 bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-[10px] rounded-sm">
                        Sold
                      </span>
                    )}
                    {item.is_resolved && (
                      <span className="px-1.5 py-0.2 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-[10px] rounded-sm">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setConfirm({ id: item.id, title: item[titleKey] })}
                  title="Delete Item"
                  className="p-1.5 rounded-sm border border-[#26262B] hover:border-[#F87171]/40 text-[#8A8A93] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
    adminAPI
      .getStats()
      .then((s) => {
        setStats(s);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, []);

  if (!user?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5 py-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Shield className="h-5 w-5 text-[#22D3EE] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Admin Panel</h1>
          <p className="text-xs text-[#8A8A93]">Platform governance and content management</p>
        </div>
      </div>

      {/* Tabs matching module filter-chip style */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            id={`admin-tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === key
                ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
            }`}
          >
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {statsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Total Users" value={stats.total_users} Icon={Users} />
                <StatCard label="Housing" value={stats.total_housing} Icon={Home} />
                <StatCard label="Marketplace" value={stats.total_marketplace} Icon={ShoppingBag} />
                <StatCard label="Lost & Found" value={stats.total_lostfound} Icon={Search} />
                <StatCard label="Opportunities" value={stats.total_opportunities} Icon={Briefcase} />
                <StatCard label="Events" value={stats.total_events} Icon={Calendar} />
              </div>

              <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
                <h2 className="text-sm font-semibold text-[#F2F2F3] mb-1">Platform Status</h2>
                <p className="text-xs text-[#8A8A93]">
                  All module services and databases are active and healthy. Select any tab above to inspect or moderate content.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span className="text-xs font-mono text-[#34D399]">CampusHub services operational</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-xs text-[#F87171]">
              Failed to load platform stats.
            </div>
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
