import React from 'react';
import { 
  Lightbulb, 
  HeartHandshake, 
  Layers, 
  CalendarCheck, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  X, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { ReflectionInsightsData } from '../types';

interface ReflectionInsightsPanelProps {
  insights?: ReflectionInsightsData;
  isGenerating: boolean;
  onGenerateInsights: () => void;
  onClose?: () => void;
  hasMessages: boolean;
  error?: string | null;
}

export function ReflectionInsightsPanel({
  insights,
  isGenerating,
  onGenerateInsights,
  onClose,
  hasMessages,
  error,
}: ReflectionInsightsPanelProps) {
  const [copiedAction, setCopiedAction] = React.useState(false);

  const handleCopyAction = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div 
      id="reflection-insights-panel" 
      className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 w-full sm:w-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-slate-200">
              Reflection Insights
            </h3>
            <p className="text-[10px] text-slate-400">
              Deep analysis & constructive personal takeaways
            </p>
          </div>
        </div>

        {onClose && (
          <button
            id="close-insights-panel-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close insights panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
        
        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-xs text-rose-300">Analysis Error</p>
              <p className="text-[11px] text-rose-400/90 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {isGenerating ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="font-medium text-slate-200">Analyzing your reflection...</p>
            <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
              Gemini is examining emotional patterns, recurring themes, and constructive growth signals.
            </p>
          </div>
        ) : insights ? (
          <>
            {/* 1. Key Insight */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Key Insight</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                  Core Realization
                </span>
              </div>
              <p className="text-slate-100 text-xs font-medium leading-relaxed">
                "{insights.keyInsight}"
              </p>
            </div>

            {/* 2. Emotional Pattern */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-[11px]">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Emotional Pattern</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                  Non-Clinical Observation
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {insights.emotionalPattern}
              </p>
              <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Derived purely from your text, without psychological diagnosis.</span>
              </div>
            </div>

            {/* 3. Recurring Theme */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-sky-300 font-semibold text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>3. Recurring Theme</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25">
                  Focal Area
                </span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {insights.recurringTheme}
              </p>
            </div>

            {/* 4. Action for Tomorrow */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/40 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px]">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Action for Tomorrow</span>
                </div>
                <button
                  onClick={() => handleCopyAction(insights.actionForTomorrow)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Copy action to clipboard"
                >
                  {copiedAction ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-100 text-xs leading-relaxed font-medium">
                {insights.actionForTomorrow}
              </div>
            </div>

            {/* 5. Growth Signal */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-purple-300 font-semibold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>5. Growth Signal</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25">
                  Progress Indicator
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {insights.growthSignal}
              </p>
            </div>

            {/* Timestamp & Isolation Confirmation */}
            {insights.generatedAt && (
              <div className="pt-2 text-center text-[10px] text-slate-500">
                Generated {new Date(insights.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Securely saved to your private journal
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center space-y-3 text-slate-500">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">Ready to extract Reflection Insights</p>
            <p className="text-[11px] max-w-[220px] mx-auto leading-relaxed text-slate-400">
              {hasMessages
                ? 'Generate structured insights to identify your key insight, emotional pattern, recurring theme, practical action, and growth signal.'
                : 'Write your thoughts in the chat first, then generate your reflection insights.'}
            </p>
          </div>
        )}

      </div>

      {/* Footer Action Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90">
        <button
          id="generate-insights-btn"
          onClick={onGenerateInsights}
          disabled={isGenerating || !hasMessages}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-xs border border-indigo-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{insights ? 'Regenerate Insights' : 'Generate Reflection Insights'}</span>
        </button>
      </div>
    </div>
  );
}
