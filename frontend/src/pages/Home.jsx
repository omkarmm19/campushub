import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  ShoppingBag,
  Search,
  Briefcase,
  Calendar,
  ArrowRight,
  Shield,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const MODULES = [
    {
      to: '/housing',
      icon: HomeIcon,
      title: 'Housing',
      description: 'Verified off-campus flats, single rooms, and roommate matching.',
      stat: 'Verified Hosts',
    },
    {
      to: '/marketplace',
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Peer-to-peer textbook exchanges, electronics, cycles, and dorm gear.',
      stat: 'Zero Commission',
    },
    {
      to: '/lost-found',
      icon: Search,
      title: 'Lost & Found',
      description: 'Campus-wide log to report, trace, and reclaim misplaced belongings.',
      stat: 'Campus Wide',
    },
    {
      to: '/opportunities',
      icon: Briefcase,
      title: 'Opportunities',
      description: 'Research lab roles, startup internships, and hackathon team formations.',
      stat: 'Student Curated',
    },
    {
      to: '/events',
      icon: Calendar,
      title: 'Campus Events',
      description: 'Technical workshops, club recruitments, cultural fests, and speaker sessions.',
      stat: 'Calendar Sync',
    },
  ];

  return (
    <div className="space-y-16 py-4">

      {/* ─── HERO SECTION: Asymmetric 2-Column SaaS Layout ──────────────── */}
      <section className="border border-[#26262B] bg-[#111113] rounded-md p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Subtle grid background texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #F2F2F3 1px, transparent 1px), linear-gradient(to bottom, #F2F2F3 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Asymmetric Typography & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-[#26262B] bg-[#17171A] text-[11px] font-mono text-[#8B8B92]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
              <span>CAMPUS INFRASTRUCTURE SYSTEM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-[#F2F2F3] tracking-[-0.03em] leading-[1.1] max-w-xl">
              The operating system for student life beyond the classroom.
            </h1>

            <p className="text-base text-[#8B8B92] leading-relaxed max-w-lg">
              CampusHub connects students across off-campus housing, peer marketplaces, lost belongings, and verified career opportunities in one unified network.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#E0921B] text-[#0A0A0B] text-xs font-semibold rounded-md transition duration-150"
                  >
                    <span>Join with College Email</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] hover:border-[#3A3A42] text-[#F2F2F3] text-xs font-medium rounded-md transition duration-150"
                  >
                    <span>Student Login</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/housing"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#E0921B] text-[#0A0A0B] text-xs font-semibold rounded-md transition duration-150"
                  >
                    <span>Explore Feed</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] hover:border-[#3A3A42] text-[#F2F2F3] text-xs font-medium rounded-md transition duration-150"
                  >
                    <span>My Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Live Stats Ticker Row */}
            <div className="pt-6 border-t border-[#1F1F24] grid grid-cols-3 gap-4 max-w-md">
              <div>
                <div className="font-mono text-xl font-semibold text-[#F2F2F3] tracking-tight">
                  100%
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider mt-0.5">
                  Verified Students
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-semibold text-[#F2F2F3] tracking-tight">
                  5+
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider mt-0.5">
                  Active Modules
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-semibold text-[#F2F2F3] tracking-tight">
                  0%
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider mt-0.5">
                  Platform Fees
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Linear-style Technical Preview Panel */}
          <div className="lg:col-span-5">
            <div className="border border-[#26262B] bg-[#0A0A0B] rounded-md overflow-hidden shadow-2xl">

              {/* Terminal Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#222226] bg-[#111113]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#26262B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#26262B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#26262B]" />
                </div>
                <span className="font-mono text-[11px] text-[#71717A] tracking-wider">
                  activity.stream // vit-vellore
                </span>
                <div className="w-8 flex justify-end">
                  <Activity className="h-3 w-3 text-[#34D399]" />
                </div>
              </div>

              {/* Simulated Live Stream Items */}
              <div className="p-3 space-y-2 font-sans text-xs">

                {/* Stream Item 1: Housing */}
                <div className="p-2.5 rounded-sm border border-[#1F1F24] bg-[#111113] hover:border-[#26262B] transition">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#71717A]">HOUSING</span>
                    <span className="px-1.5 py-0.2 rounded-sm border border-[#34D399]/25 bg-[#34D399]/5 text-[10px] font-medium text-[#34D399]">
                      Available
                    </span>
                  </div>
                  <div className="text-[#F2F2F3] font-medium truncate">
                    Double Sharing Room · Green Valley
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B8B92] mt-1 font-mono">
                    <span>₹4,500/mo</span>
                    <span>10m ago</span>
                  </div>
                </div>

                {/* Stream Item 2: Marketplace */}
                <div className="p-2.5 rounded-sm border border-[#1F1F24] bg-[#111113] hover:border-[#26262B] transition">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#71717A]">MARKETPLACE</span>
                    <span className="px-1.5 py-0.2 rounded-sm border border-[#38BDF8]/25 bg-[#38BDF8]/5 text-[10px] font-medium text-[#38BDF8]">
                      For Sale
                    </span>
                  </div>
                  <div className="text-[#F2F2F3] font-medium truncate">
                    Casio FX-991CW Scientific Calculator
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B8B92] mt-1 font-mono">
                    <span>₹850</span>
                    <span>32m ago</span>
                  </div>
                </div>

                {/* Stream Item 3: Lost & Found */}
                <div className="p-2.5 rounded-sm border border-[#1F1F24] bg-[#111113] hover:border-[#26262B] transition">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#71717A]">LOST & FOUND</span>
                    <span className="px-1.5 py-0.2 rounded-sm border border-[#34D399]/25 bg-[#34D399]/5 text-[10px] font-medium text-[#34D399]">
                      Found
                    </span>
                  </div>
                  <div className="text-[#F2F2F3] font-medium truncate">
                    Calculator in TT Library 2nd Floor
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B8B92] mt-1 font-mono">
                    <span>Library Counter</span>
                    <span>1h ago</span>
                  </div>
                </div>

                {/* Stream Item 4: Opportunities */}
                <div className="p-2.5 rounded-sm border border-[#1F1F24] bg-[#111113] hover:border-[#26262B] transition">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#71717A]">OPPORTUNITY</span>
                    <span className="px-1.5 py-0.2 rounded-sm border border-[#34D399]/25 bg-[#34D399]/5 text-[10px] font-medium text-[#34D399]">
                      Open
                    </span>
                  </div>
                  <div className="text-[#F2F2F3] font-medium truncate">
                    Frontend Intern @ Campus Startup Lab
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B8B92] mt-1 font-mono">
                    <span>Remote / Hybrid</span>
                    <span>2h ago</span>
                  </div>
                </div>

              </div>

              {/* Panel Footer */}
              <div className="px-3 py-2 bg-[#0E0E10] border-t border-[#1F1F24] flex items-center justify-between font-mono text-[11px] text-[#71717A]">
                <span>Status: Connected</span>
                <span className="text-[#34D399] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  Live Sync
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── CAMPUS MODULES GRID ────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#26262B] pb-4">
          <div>
            <div className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
              System Architecture
            </div>
            <h2 className="text-xl font-semibold text-[#F2F2F3] tracking-[-0.02em] mt-1">
              Core Campus Modules
            </h2>
          </div>
          <p className="text-xs text-[#8B8B92]">
            Restricted to verified university email accounts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MODULES.map(({ to, icon: Icon, title, description, stat }) => (
            <Link
              key={to}
              to={to}
              className="group p-4 bg-[#111113] border border-[#26262B] hover:border-[#3A3A42] hover:bg-[#141417] rounded-md transition duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Header with single-tone icon + arrow */}
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-5 w-5 text-[#8B8B92] group-hover:text-[#F2F2F3] transition" />
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#52525A] group-hover:text-[#F5A623] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-150" />
                </div>

                <h3 className="text-sm font-semibold text-[#F2F2F3] tracking-tight group-hover:text-white transition">
                  {title}
                </h3>
                <p className="text-xs text-[#8B8B92] leading-relaxed mt-1.5">
                  {description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F1F24] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                <span>{stat}</span>
                <span className="text-[#8B8B92] group-hover:text-[#F5A623] transition">
                  Browse →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── VISITOR SECURITY BANNER ────────────────────────────────────── */}
      {!user && (
        <section className="border border-[#26262B] bg-[#111113] rounded-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm border border-[#26262B] bg-[#17171A] text-[#8B8B92]">
              <Shield className="h-4 w-4 text-[#F5A623]" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#F2F2F3]">
                University Domain Gatekeeping
              </div>
              <div className="text-xs text-[#8B8B92] mt-0.5">
                Full student contact information and listing creation require an active college authentication session.
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="whitespace-nowrap px-3.5 py-1.5 bg-[#17171A] hover:bg-[#1E1E22] text-[#F2F2F3] hover:text-white border border-[#26262B] hover:border-[#3A3A42] text-xs font-medium rounded-md transition shrink-0"
          >
            Authenticate Account →
          </Link>
        </section>
      )}

    </div>
  );
}
