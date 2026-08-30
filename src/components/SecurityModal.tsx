import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, KeyRound, Database, Cpu, X, CheckCircle2 } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-100">
                Security & Isolation Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Strict user isolation, rule enforcement, and credential protection
              </p>
            </div>
          </div>
          <button
            id="close-security-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* User Isolated Storage Path */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Isolated Firestore Partition</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-mono font-medium">
                ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Your journal entries, multi-turn dialogues, and generated summaries are strictly stored within your private user partition:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-indigo-300/90 break-all select-all border border-slate-800">
              /users/{user?.uid || '{your_authenticated_uid}'}/interactions/*
            </div>
          </div>

          {/* Firestore Security Rules Block */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-200 font-medium">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Owner-Bound Firestore Security Rules</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto shadow-inner">
              <pre className="text-emerald-400/90">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}`}</pre>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Direct cross-user read/write attempts by other authenticated users are rejected at the database level.
            </p>
          </div>

          {/* Secret & AI Isolation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>Zero Client Secret Exposure</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini API keys are protected on the trusted backend server and never sent to or bundled in browser JavaScript.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Multi-Model Resilience</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built-in fallback sequence (Gemini 2.5 Flash, 3.1 Flash Lite, 3.7 Flash) guarantees high availability during quota spikes.
              </p>
            </div>
          </div>

          {/* Active User Session Details */}
          {user && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Authenticated Firebase UID:</span>
              <span className="font-mono text-slate-300 font-medium">{user.uid}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-slate-700/70"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
