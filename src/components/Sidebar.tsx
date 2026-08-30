import React, { useState } from 'react';
import type { JournalSession, ReflectionMood } from '../types';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Download, 
  ChevronRight,
  Filter,
  Lightbulb
} from 'lucide-react';

interface SidebarProps {
  sessions: JournalSession[];
  activeSessionId: string | null;
  onSelectSession: (session: JournalSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onExportAll: () => void;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const MOOD_COLORS: Record<ReflectionMood, string> = {
  Grateful: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Calm: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  Energized: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Reflective: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Challenged: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  Creative: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  Anxious: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  Accomplished: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
};

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onExportAll,
  isLoading,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('ALL');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.previewSnippet && s.previewSnippet.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.summary?.reflections && s.summary.reflections.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.insights?.keyInsight && s.insights.keyInsight.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.insights?.recurringTheme && s.insights.recurringTheme.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMood = selectedMoodFilter === 'ALL' || s.mood === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & New Session Button */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <button
            id="new-session-btn"
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection Session</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-sessions-input"
              type="text"
              placeholder="Search reflections & themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Mood Filter Pill Scroll */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              onClick={() => setSelectedMoodFilter('ALL')}
              className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                selectedMoodFilter === 'ALL'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 font-medium'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              All ({sessions.length})
            </button>
            {(['Grateful', 'Calm', 'Reflective', 'Creative', 'Challenged'] as ReflectionMood[]).map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMoodFilter(mood)}
                className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMoodFilter === mood
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-medium'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-300'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2 text-xs">
              <div className="w-5 h-5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
              <span>Loading saved journal history...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-xs font-medium text-slate-400">No journal sessions found</p>
              <p className="text-[11px]">
                {searchQuery ? 'Try adjusting your search filter' : 'Begin your first conversation with Gemini above'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const moodColor = session.mood && MOOD_COLORS[session.mood] 
                ? MOOD_COLORS[session.mood] 
                : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session);
                    onCloseMobile();
                  }}
                  className={`group relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs font-semibold line-clamp-1 ${
                      isActive ? 'text-indigo-300' : 'text-slate-200 group-hover:text-slate-100'
                    }`}>
                      {session.title || 'Reflection Session'}
                    </h4>
                    
                    <button
                      id={`delete-session-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete session "${session.title}" permanently?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity rounded cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {session.previewSnippet && (
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {session.previewSnippet}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {session.insights && (
                        <span className="flex items-center space-x-0.5 text-amber-400 font-medium px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20" title="Reflection Insights generated">
                          <Lightbulb className="w-2.5 h-2.5" />
                          <span>Insights</span>
                        </span>
                      )}
                      {session.mood && (
                        <span className={`px-1.5 py-0.2 rounded border font-medium ${moodColor}`}>
                          {session.mood}
                        </span>
                      )}
                      {session.interactionsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                          {session.interactionsCount} {session.interactionsCount === 1 ? 'turn' : 'turns'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Export Personal Journal */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <button
            id="export-journal-btn"
            onClick={onExportAll}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 border border-slate-700/70 transition-colors cursor-pointer"
            title="Download personal journal archive"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Personal Journal (JSON)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
