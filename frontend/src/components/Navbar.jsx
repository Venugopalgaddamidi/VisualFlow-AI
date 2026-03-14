import React from 'react';
import { Link } from 'react-router-dom';
import { Network, Moon, Sun } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  const appName = import.meta.env.VITE_APP_NAME || 'VisualFlow AI';

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b-0 rounded-none rounded-b-2xl shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-primary-500/10 p-2 rounded-lg group-hover:bg-primary-500/20 transition-colors">
                <Network className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span
                className="flowing-title text-[1.45rem] font-extrabold tracking-tight bg-gradient-to-r from-primary-600 via-indigo-500 to-fuchsia-500
                           dark:from-primary-300 dark:via-indigo-300 dark:to-fuchsia-300 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(79,70,229,0.45)]"
              >
                {appName}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors border border-transparent dark:border-slate-700/50"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
