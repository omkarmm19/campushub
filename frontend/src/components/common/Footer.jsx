import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span>CampusHub</span>
          </div>

          <p className="text-sm text-slate-500 text-center">
            Students helping students through a single, community-driven platform.
          </p>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CampusHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
