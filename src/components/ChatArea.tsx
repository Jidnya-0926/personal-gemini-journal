import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { 
  ChatMessage, 
  JournalInteraction, 
  JournalSession, 
  ReflectionMood,
  SessionSummaryData
} from '../types';
import { 
  Send, 
  Sparkles, 
  CloudCheck, 
  AlertCircle, 
  RefreshCw, 
  Smile, 
  Menu, 
  SlidersHorizontal,
  Bot,
  User as UserIcon,
  Tag,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

interface ChatAreaProps {
  currentSession: JournalSession | null;
  interactions: JournalInteraction[];
  onSendMessage: (text: string, mood: ReflectionMood) => Promise<void>;
  onUpdateSessionTitle: (title: string) => Promise<void>;
  onSelectMood: (mood: ReflectionMood) => void;
  onToggleSidebarMobile: () => void;
  onToggleSummaryPanel: () => void;
  isSummaryPanelOpen: boolean;
  onToggleInsightsPanel: () => void;
  isInsightsPanelOpen: boolean;
  isLoadingAi: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  lastSaveError?: string | null;
  onRetrySave?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Daily Energy Audit',
    prompt: 'Help me reflect on what drained my energy today and what gave me life.',
    mood: 'Reflective' as ReflectionMood,
  },
  {
    title: 'Reframe a Challenge',
    prompt: 'I am wrestling with a tough decision or frustration. Can you help me look at it with fresh perspective?',
    mood: 'Challenged' as ReflectionMood,
  },
  {
    title: 'Gratitude & Wins',
    prompt: 'I want to celebrate a quiet win and acknowledge three things I am genuinely grateful for.',
    mood: 'Grateful' as ReflectionMood,
  },
  {
    title: 'Creative Brainstorm',
    prompt: 'I have an emerging idea I want to bounce around and untangle into clear possibilities.',
    mood: 'Creative' as ReflectionMood,
  },
];

const MOODS: ReflectionMood[] = [
  'Reflective',
  'Grateful',
  'Calm',
  'Energized',
  'Creative',
  'Challenged',
  'Anxious',
  'Accomplished',
];

export function ChatArea({
  currentSession,
  interactions,
  onSendMessage,
  onUpdateSessionTitle,
  onSelectMood,
  onToggleSidebarMobile,
  onToggleSummaryPanel,
  isSummaryPanelOpen,
  onToggleInsightsPanel,
  isInsightsPanelOpen,
  isLoadingAi,
  saveStatus,
  lastSaveError,
  onRetrySave,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [selectedMood, setSelectedMood] = useState<ReflectionMood>(
    currentSession?.mood || 'Reflective'
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentSession?.title || 'New Reflection Session');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentSession?.title) {
      setTitleValue(currentSession.title);
    }
    if (currentSession?.mood) {
      setSelectedMood(currentSession.mood);
    }
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions, isLoadingAi]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoadingAi) return;

    const message = inputText.trim();
    setInputText('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(message, selectedMood);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== currentSession?.title) {
      await onUpdateSessionTitle(titleValue.trim());
    }
  };

  const handleMoodClick = (mood: ReflectionMood) => {
    setSelectedMood(mood);
    onSelectMood(mood);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Top Session Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xs flex items-center justify-between z-10">
        
        {/* Left: Mobile Sidebar toggle & Session Title */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebarMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open journal history"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                id="edit-session-title-input"
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="w-full max-w-md px-2.5 py-1 bg-slate-950 border border-indigo-500/50 rounded-lg text-sm font-serif font-semibold text-indigo-200 focus:outline-none ring-1 ring-indigo-500/30"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="font-serif text-sm sm:text-base font-semibold text-slate-200 hover:text-indigo-300 cursor-pointer truncate max-w-md flex items-center space-x-1.5 group"
                title="Click to rename session"
              >
                <span>{currentSession?.title || 'Reflection Session'}</span>
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 font-sans">
                  (edit)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cloud Sync indicator & Summary toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Persistence status badge */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400">
            {saveStatus === 'saving' ? (
              <div className="flex items-center space-x-1.5 text-indigo-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px]">Syncing to Firestore...</span>
              </div>
            ) : saveStatus === 'error' ? (
              <button
                onClick={onRetrySave}
                className="flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                title={lastSaveError || 'Error saving to Firestore. Click to retry.'}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] underline">Retry Save</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 text-emerald-400/90">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px] text-slate-400 font-medium">Isolated & Saved</span>
              </div>
            )}
          </div>

          {/* Toggle Reflection Insights Button */}
          <button
            id="toggle-insights-panel-btn"
            onClick={onToggleInsightsPanel}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isInsightsPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs ring-1 ring-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Open Reflection Insights (Key Insight, Emotional Pattern, Recurring Theme, Action, Growth Signal)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reflection Insights</span>
          </button>

          {/* Toggle Summary Button */}
          <button
            id="toggle-summary-panel-btn"
            onClick={onToggleSummaryPanel}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isSummaryPanelOpen
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Synthesis</span>
          </button>

        </div>

      </div>

      {/* Mood Selector Subheader */}
      <div className="px-4 sm:px-6 py-2 border-b border-slate-800/60 bg-slate-900/40 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Smile className="w-3 h-3 text-slate-400" />
          <span>Mood:</span>
        </span>
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodClick(mood)}
            className={`px-2.5 py-0.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedMood === mood
                ? 'bg-indigo-600 text-white font-medium shadow-xs ring-1 ring-indigo-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Conversation / Interactions Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        
        {interactions.length === 0 ? (
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300">
            
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/10">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                What is present in your mind right now?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-light leading-relaxed">
                Reflect freely without judgment. Gemini will listen attentively, help you untangle core emotions, and highlight meaningful patterns.
              </p>
            </div>

            {/* Prompt Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {STARTER_PROMPTS.map((sp, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedMood(sp.mood);
                    setInputText(sp.prompt);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    <span>{sp.title}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-indigo-400/80">
                      {sp.mood}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                    "{sp.prompt}"
                  </p>
                </div>
              ))}
            </div>

          </div>
        ) : (
          interactions.map((turn, index) => (
            <div key={turn.id || index} className="space-y-4 max-w-3xl mx-auto">
              
              {/* User Prompt Turn */}
              <div className="flex items-start justify-end space-x-3">
                <div className="max-w-[85%] rounded-2xl bg-indigo-600/15 border border-indigo-500/30 p-4 text-slate-100 text-sm leading-relaxed shadow-xs">
                  <div className="flex items-center justify-between mb-1.5 text-[10px] text-indigo-300/90 font-medium">
                    <span>You</span>
                    {turn.mood && (
                      <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {turn.mood}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap font-sans">
                    {turn.userPrompt}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Gemini Model Response Turn */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="max-w-[85%] rounded-2xl bg-slate-900 border border-slate-800 p-4 text-slate-200 text-sm leading-relaxed shadow-sm">
                  <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <span>Gemini Companion</span>
                      <span className="text-indigo-400">✦</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(turn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="markdown-body prose prose-invert prose-slate max-w-none text-xs sm:text-sm text-slate-300 space-y-3">
                    <ReactMarkdown>{turn.geminiResponse}</ReactMarkdown>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}

        {/* Insight trigger banner when interactions exist */}
        {interactions.length > 0 && !isLoadingAi && (
          <div className="max-w-3xl mx-auto pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {currentSession?.insights
                  ? 'Reflection Insights are generated and saved for this session.'
                  : 'Ready to extract your Key Insight, Emotional Pattern & Growth Signals?'}
              </span>
            </div>
            <button
              id="stream-open-insights-btn"
              onClick={onToggleInsightsPanel}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer shrink-0 ml-2"
            >
              {currentSession?.insights ? 'View Insights' : 'Analyze Session'}
            </button>
          </div>
        )}

        {/* Loading Gemini AI Response Indicator */}
        {isLoadingAi && (
          <div className="flex items-start space-x-3 max-w-3xl mx-auto animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4 text-slate-400 text-xs flex items-center space-x-3 shadow-sm">
              <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Gemini is reflecting on your entry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              id="journal-input-textarea"
              rows={2}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Write your reflection, thoughts, or questions (Mood: ${selectedMood})...`}
              className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-40 font-sans"
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-900/90 bg-slate-950/80 rounded-b-2xl">
              <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Enter</kbd> to reflect</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Shift+Enter</kbd> for newline</span>
              </div>

              <button
                id="send-reflection-btn"
                type="submit"
                disabled={!inputText.trim() || isLoadingAi}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-medium text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
              >
                <span>Reflect</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}
