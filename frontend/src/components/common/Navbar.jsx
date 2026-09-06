import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, ShoppingBag, Search, Briefcase,
  Calendar, Bookmark, User, LogOut, Shield, Menu, X,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/housing', icon: Home, label: 'Housing' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/lost-found', icon: Search, label: 'Lost & Found' },
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/events', icon: Calendar, label: 'Events' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[#222226]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[52px]">

          {/* Left: Brand Lockup */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 text-base font-semibold text-[#F2F2F3] tracking-tight hover:opacity-90 transition"
            >
              <span className="font-semibold tracking-tight">CampusHub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] inline-block" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              {NAV_LINKS.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition duration-150 ${
                      active
                        ? 'text-[#F2F2F3] bg-[#17171A] border border-[#26262B]'
                        : 'text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#141417]'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#F5A623]' : 'text-[#71717A]'}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Desktop User Controls */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/saved"
                  title="Saved Posts"
                  className={`p-1.5 rounded-md border transition ${
                    isActive('/saved')
                      ? 'text-[#F2F2F3] bg-[#17171A] border-[#26262B]'
                      : 'text-[#8B8B92] border-transparent hover:text-[#F2F2F3] hover:bg-[#141417]'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                </Link>

                {user.is_admin && (
                  <Link
                    to="/admin"
                    title="Admin Panel"
                    className={`p-1.5 rounded-md border transition ${
                      isActive('/admin')
                        ? 'text-[#F5A623] bg-[#17171A] border-[#F5A623]/30'
                        : 'text-[#8B8B92] border-transparent hover:text-[#F5A623] hover:bg-[#17171A]'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                  </Link>
                )}

                <Link
                  to="/profile"
                  title="Profile Settings"
                  className={`p-1.5 rounded-md border transition ${
                    isActive('/profile')
                      ? 'text-[#F2F2F3] bg-[#17171A] border-[#26262B]'
                      : 'text-[#8B8B92] border-transparent hover:text-[#F2F2F3] hover:bg-[#141417]'
                  }`}
                >
                  <User className="h-4 w-4" />
                </Link>

                <div className="h-4 w-px bg-[#26262B] mx-1" />

                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    isActive('/dashboard')
                      ? 'bg-[#17171A] text-[#F2F2F3] border-[#26262B]'
                      : 'bg-[#111113] text-[#8B8B92] border-[#26262B] hover:text-[#F2F2F3] hover:border-[#3A3A42]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-medium text-[#0A0A0B] bg-[#F5A623] hover:bg-[#E0921B] rounded-md transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] border border-[#26262B] transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#222226] bg-[#0E0E10] px-4 py-3 space-y-1">
          {/* Module Links */}
          {NAV_LINKS.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                  active
                    ? 'text-[#F2F2F3] bg-[#17171A] border border-[#26262B]'
                    : 'text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#141417]'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-[#F5A623]' : 'text-[#71717A]'}`} />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-[#1F1F24] my-2" />

          {/* User Section */}
          {user ? (
            <div className="space-y-1 pt-1">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[#F2F2F3] hover:bg-[#17171A] transition"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#71717A]" />
                  <span>Dashboard</span>
                </div>
                <span className="font-mono text-[11px] text-[#71717A]">{user.name.split(' ')[0]}</span>
              </Link>

              <Link
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] transition"
              >
                <Bookmark className="h-4 w-4 text-[#71717A]" />
                <span>Saved Posts</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] transition"
              >
                <User className="h-4 w-4 text-[#71717A]" />
                <span>Profile Settings</span>
              </Link>

              {user.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#F5A623] hover:bg-[#17171A] transition"
                >
                  <Shield className="h-4 w-4 text-[#F5A623]" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 border border-[#26262B] bg-[#111113] hover:bg-[#17171A] text-xs font-medium text-[#F2F2F3] rounded-md transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2 bg-[#F5A623] hover:bg-[#E0921B] text-xs font-medium text-[#0A0A0B] rounded-md transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
