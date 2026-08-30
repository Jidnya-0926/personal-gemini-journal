import React, { useState } from 'react';
import type { SessionSummaryData, ReflectionMood } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Lightbulb, 
  ListChecks, 
  RefreshCw, 
  X,
  Smile
} from 'lucide-react';

interface SummaryPanelProps {
  summary?: SessionSummaryData;
  isGenerating: boolean;
  onGenerateSummary: () => void;
  onClose?: () => void;
  hasMessages: boolean;
}

export function SummaryPanel({
  summary,
  isGenerating,
  onGenerateSummary,
  onClose,
  hasMessages,
}: SummaryPanelProps) {
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 w-full sm:w-96 overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-slate-200">
              Session Synthesis
            </h3>
            <p className="text-[10px] text-slate-400">
              AI-distilled insights & action steps
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close summary panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
        
        {isGenerating ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="font-medium text-slate-300">Synthesizing reflection...</p>
            <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
              Gemini is extracting key themes, emotional mood, and core takeaways.
            </p>
          </div>
        ) : summary ? (
          <>
            {/* Title & Mood */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Focus Title
                </span>
                {summary.mood && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium">
                    <Smile className="w-3 h-3" />
                    <span>{summary.mood}</span>
                  </span>
                )}
              </div>
              <h4 className="font-serif text-base font-bold text-slate-100 leading-snug">
                {summary.title}
              </h4>
            </div>

            {/* Key Themes */}
            {summary.keyThemes && summary.keyThemes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Key Themes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.keyThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/70 text-indigo-200 text-[11px] font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Synthesized Reflections */}
            {summary.reflections && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/90 space-y-2 shadow-xs">
                <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Core Insight & Perspective</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {summary.reflections}
                </p>
              </div>
            )}

            {/* Action Items / Self-Care Prompts */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
                  <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actionable Takeaways</span>
                </div>
                <div className="space-y-1.5">
                  {summary.actionItems.map((item, idx) => {
                    const isDone = Boolean(completedItems[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItem(idx)}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-400 line-through'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isDone ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center space-y-3 text-slate-500">
            <Sparkles className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-xs font-medium text-slate-400">No session summary yet</p>
            <p className="text-[11px] max-w-[220px] mx-auto leading-relaxed">
              {hasMessages
                ? 'Generate a comprehensive summary to distill breakthroughs and actionable next steps.'
                : 'Start reflecting with Gemini to generate key takeaways.'}
            </p>
          </div>
        )}

      </div>

      {/* Footer Action Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90">
        <button
          id="generate-summary-btn"
          onClick={onGenerateSummary}
          disabled={isGenerating || !hasMessages}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/80 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{summary ? 'Refresh Session Summary' : 'Synthesize Session Summary'}</span>
        </button>
      </div>

    </div>
  );
}
