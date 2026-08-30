import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Lock, Compass, Brain, ArrowRight, BookHeart, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  onOpenSecurityModal: () => void;
}

export function LandingPage({ onOpenSecurityModal }: LandingPageProps) {
  const { login, loading, authError, clearAuthError } = useAuth();

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between bg-slate-950 text-slate-100">
      
      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        
        {/* Top Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Private Reflection Companion & AI Journal</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 max-w-4xl leading-[1.15]">
          A serene space to <span className="italic font-normal text-indigo-400">reflect</span>, untangle thoughts, and gain clarity.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
          Engage in thoughtful multi-turn dialogues with Gemini. Deconstruct complex days, explore deep emotions, and automatically synthesize actionable insights.
        </p>

        {/* Auth Error Banner if any */}
        {authError && (
          <div className="mt-6 w-full max-w-md p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-3 text-left shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-rose-300">Authentication Alert</div>
              <div className="mt-0.5">{authError}</div>
              <button
                onClick={clearAuthError}
                className="mt-2 text-[11px] font-medium underline hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            id="google-signin-hero-btn"
            onClick={login}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer ring-1 ring-indigo-400/30"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting with Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>

          <button
            id="explore-security-btn"
            onClick={onOpenSecurityModal}
            className="w-full sm:w-auto px-5 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700/80 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Verify Security & Isolation</span>
          </button>
        </div>

        {/* Pillars / Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-slate-100">
              Multi-Turn Deep Reflection
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Gemini acts as a thoughtful sounding board—validating feelings, illuminating blind spots, and asking grounded follow-up questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-slate-100">
              Strict User Partitioning
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every journal record is bound to your Firebase UID. Firestore Security Rules enforce that no other user can access your reflections.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900/90 transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-slate-100">
              Automated Session Summaries
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Each session extracts key themes, emotional mood trajectories, breakthrough insights, and gentle action items for personal growth.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <p>Personal Gemini Journal • Built with Firebase Authentication, Cloud Firestore & Google Gemini</p>
      </footer>

    </div>
  );
}
