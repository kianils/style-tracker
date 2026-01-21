import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, FileText, BarChart3 } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-white">Style Tracker</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/analyze"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/analyze') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              Analyze
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
