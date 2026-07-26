import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Home, ShoppingBag, Search, Briefcase, Calendar, Bookmark, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span>Campus<span className="text-slate-900">Hub</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link to="/housing" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition">
              <Home className="h-4 w-4" /> Housing
            </Link>
            <Link to="/marketplace" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition">
              <ShoppingBag className="h-4 w-4" /> Marketplace
            </Link>
            <Link to="/lost-found" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition">
              <Search className="h-4 w-4" /> Lost & Found
            </Link>
            <Link to="/opportunities" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition">
              <Briefcase className="h-4 w-4" /> Opportunities
            </Link>
            <Link to="/events" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition">
              <Calendar className="h-4 w-4" /> Events
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/saved" className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition" title="Saved Posts">
                  <Bookmark className="h-5 w-5" />
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Admin Panel">
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-800 text-sm font-medium">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
