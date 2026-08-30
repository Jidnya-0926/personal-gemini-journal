import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SecurityModal } from './components/SecurityModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-indigo-600/30 animate-pulse border border-indigo-400/30">
          ✦
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span>Verifying secure Firebase session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />
      
      {user ? (
        <Dashboard />
      ) : (
        <LandingPage onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />
      )}

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
