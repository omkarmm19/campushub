import { Link } from 'react-router-dom';
import { Home as HomeIcon, ShoppingBag, Search, Briefcase, Calendar, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 md:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Users className="h-3.5 w-3.5" /> Student-Powered Campus Community
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            One platform for student life <span className="text-indigo-400">beyond the classroom.</span>
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl font-normal leading-relaxed">
            Find off-campus housing, buy & sell student essentials, recover lost belongings, and discover internships & campus events.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {!user ? (
              <>
                <Link to="/register" className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center gap-2">
                  Join CampusHub <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition">
                  Log in
                </Link>
              </>
            ) : (
              <Link to="/housing" className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center gap-2">
                Explore Listings <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Campus Modules</h2>
          <p className="text-sm text-slate-500 mt-1">Everything you need as a college student</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Link to="/housing" className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <HomeIcon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">Housing</h3>
            <p className="text-xs text-slate-500 mt-1">Rooms & roommate search outside campus</p>
          </Link>

          <Link to="/marketplace" className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">Marketplace</h3>
            <p className="text-xs text-slate-500 mt-1">Buy, sell, or rent student essentials</p>
          </Link>

          <Link to="/lost-found" className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">Lost & Found</h3>
            <p className="text-xs text-slate-500 mt-1">Recover lost belongings on campus</p>
          </Link>

          <Link to="/opportunities" className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">Opportunities</h3>
            <p className="text-xs text-slate-500 mt-1">Internships, hackathons & workshops</p>
          </Link>

          <Link to="/events" className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">Events</h3>
            <p className="text-xs text-slate-500 mt-1">Technical, cultural & sports events</p>
          </Link>
        </div>
      </section>

      {/* Visitor Notice Banner */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                Log in to view contact details, save posts, and post your own listings.
              </p>
            </div>
            <Link to="/login" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shrink-0 transition">
              Log In Now
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
