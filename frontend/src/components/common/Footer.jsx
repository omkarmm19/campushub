export default function Footer() {
  return (
    <footer className="bg-[#0A0A0B] text-[#71717A] py-8 border-t border-[#222226] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">

          {/* Left: Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F2F2F3] tracking-tight">
              <span>CampusHub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] inline-block" />
            </div>
            <span className="text-[#26262B]">/</span>
            <p className="text-[#8B8B92]">
              Student infrastructure for life beyond the classroom.
            </p>
          </div>

          {/* Right: Operational Status & Copyright */}
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-[#34D399] bg-[#34D399]/5 px-2 py-0.5 rounded border border-[#34D399]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>All systems operational</span>
            </div>

            <span className="text-[#8B8B92]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
