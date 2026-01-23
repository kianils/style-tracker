import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, FileText, BarChart3, Info, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/50 dark:bg-slate-800/50 backdrop-blur-lg border-b border-white/10 dark:border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-white dark:text-slate-100">Style Tracker</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/analyze"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/analyze') 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              Analyze
            </Link>
            <Link
              to="/about"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/about') 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 dark:text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <Info className="w-5 h-5" />
              About
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
