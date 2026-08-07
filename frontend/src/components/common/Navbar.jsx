import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Home, ShoppingBag, Search, Briefcase,
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
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span>Campus<span className="text-slate-900">Hub</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
                    isActive(to)
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop User Controls */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/saved"
                    title="Saved Posts"
                    className={`p-2 rounded-lg transition ${
                      isActive('/saved')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className="h-5 w-5" />
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      title="Admin Panel"
                      className={`p-2 rounded-lg transition ${
                        isActive('/admin')
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive('/dashboard')
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <User className="h-4 w-4 text-indigo-600" />
                    <span>{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition">
                    Log in
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {/* Module links */}
              {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive(to)
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-slate-100 my-2" />

              {/* Auth section */}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition">
                    <User className="h-5 w-5" />
                    Dashboard
                    <span className="ml-auto text-xs text-slate-400 font-normal">{user.name.split(' ')[0]}</span>
                  </Link>
                  <Link to="/saved" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition">
                    <Bookmark className="h-5 w-5" />
                    Saved Posts
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50 transition">
                      <Shield className="h-5 w-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4 py-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 text-center hover:bg-slate-50 transition">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white text-center shadow-sm shadow-indigo-200 transition">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
