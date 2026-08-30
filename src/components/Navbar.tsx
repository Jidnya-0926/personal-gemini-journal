import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, LogOut, BookOpen, User } from 'lucide-react';

interface NavbarProps {
  onOpenSecurityModal: () => void;
}

export function Navbar({ onOpenSecurityModal }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 text-slate-100 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-serif font-bold text-lg">
            ✦
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-lg tracking-tight font-semibold text-slate-100">
                Personal Gemini Journal
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Isolated Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden md:block">
              Private AI-assisted reflection & multi-turn journaling
            </p>
          </div>
        </div>

        {/* Right: User profile, security badge & sign out */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          <button
            id="security-info-btn"
            onClick={onOpenSecurityModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-300 hover:bg-slate-800 border border-slate-700/70 transition-colors cursor-pointer"
            title="View Security & Isolation Architecture"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Security Shield</span>
          </button>

          {user && (
            <div className="flex items-center pl-2 border-l border-slate-800 space-x-3">
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover ring-1 ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                    {user.displayName || 'Journaler'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {user.email || 'Google Account'}
                  </div>
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={logout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-900/60 transition-colors cursor-pointer"
                title="Sign out of your session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
