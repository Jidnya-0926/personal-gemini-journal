import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { SummaryPanel } from './SummaryPanel';
import { ReflectionInsightsPanel } from './ReflectionInsightsPanel';
import { 
  getSessions, 
  saveSession, 
  saveSessionInsights,
  deleteSession as deleteSessionFromDb,
  getInteractions, 
  saveInteraction,
  deleteInteraction 
} from '../lib/firebase';
import type { 
  JournalSession, 
  JournalInteraction, 
  ReflectionMood,
  SessionSummaryData,
  ReflectionInsightsData
} from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [activeSession, setActiveSession] = useState<JournalSession | null>(null);
  const [interactions, setInteractions] = useState<JournalInteraction[]>([]);
  
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState<boolean>(false);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState<boolean>(false);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);

  // 1. Load initial sessions for authenticated user
  const fetchUserSessions = useCallback(async () => {
    if (!user) return;
    setIsLoadingSessions(true);
    try {
      const userSessions = await getSessions(user.uid);
      setSessions(userSessions);

      if (userSessions.length > 0) {
        // Select the most recent session if none active
        setActiveSession((prev) => prev || userSessions[0]);
      } else {
        // Create an initial session
        const initialSession: JournalSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.uid,
          title: 'First Reflection',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          interactionsCount: 0,
          mood: 'Reflective',
          previewSnippet: 'Start writing your first reflection...',
        };
        await saveSession(user.uid, initialSession);
        setSessions([initialSession]);
        setActiveSession(initialSession);
      }
    } catch (err: any) {
      console.error('[Dashboard Load Sessions Error]:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  // 2. Load interactions when active session changes
  useEffect(() => {
    if (!user || !activeSession?.id) {
      setInteractions([]);
      return;
    }

    let isMounted = true;
    const fetchInteractions = async () => {
      setIsLoadingInteractions(true);
      try {
        const loadedInteractions = await getInteractions(user.uid, activeSession.id);
        if (isMounted) {
          setInteractions(loadedInteractions);
        }
      } catch (err: any) {
        console.error('[Dashboard Load Interactions Error]:', err);
      } finally {
        if (isMounted) {
          setIsLoadingInteractions(false);
        }
      }
    };

    fetchInteractions();
    return () => {
      isMounted = false;
    };
  }, [user, activeSession?.id]);

  // 3. Create a new journal session
  const handleNewSession = async () => {
    if (!user) return;
    const newSession: JournalSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.uid,
      title: `Reflection ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      interactionsCount: 0,
      mood: 'Reflective',
      previewSnippet: '',
    };

    try {
      setSaveStatus('saving');
      await saveSession(user.uid, newSession);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
      setInteractions([]);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('[Create New Session Error]:', err);
      setSaveStatus('error');
      setLastSaveError('Failed to create new session in Firestore.');
    }
  };

  // 4. Delete a session
  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      await deleteSessionFromDb(user.uid, sessionId);
      const remainingSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(remainingSessions);

      if (activeSession?.id === sessionId) {
        if (remainingSessions.length > 0) {
          setActiveSession(remainingSessions[0]);
        } else {
          handleNewSession();
        }
      }
    } catch (err: any) {
      console.error('[Delete Session Error]:', err);
      alert('Could not delete session. Please check your connection.');
    }
  };

  // 5. Update session title
  const handleUpdateSessionTitle = async (newTitle: string) => {
    if (!user || !activeSession) return;
    const updated = {
      ...activeSession,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setActiveSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    try {
      await saveSession(user.uid, updated);
    } catch (err: any) {
      console.error('[Update Title Error]:', err);
    }
  };

  // 6. Select Mood
  const handleSelectMood = async (mood: ReflectionMood) => {
    if (!user || !activeSession) return;
    const updated = {
      ...activeSession,
      mood,
      updatedAt: Date.now(),
    };
    setActiveSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    try {
      await saveSession(user.uid, updated);
    } catch (err: any) {
      console.error('[Update Mood Error]:', err);
    }
  };

  // 7. Send Message & Multi-Turn Gemini Interaction
  const handleSendMessage = async (text: string, mood: ReflectionMood) => {
    if (!user || !activeSession) return;

    const interactionId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempInteraction: JournalInteraction = {
      id: interactionId,
      userId: user.uid,
      sessionId: activeSession.id,
      userPrompt: text,
      geminiResponse: 'Reflecting...',
      mood,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Format all previous messages into chat format
    const historyPayload = interactions.flatMap((item) => [
      { role: 'user' as const, content: item.userPrompt },
      { role: 'model' as const, content: item.geminiResponse },
    ]);
    historyPayload.push({ role: 'user' as const, content: text });

    setIsLoadingAi(true);
    setSaveStatus('saving');

    try {
      // Server-side Gemini API call with automatic model fallback
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          mood: mood || activeSession.mood || 'Reflective',
          userContext: { displayName: user.displayName || 'Journaler' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to reach Gemini AI.`);
      }

      const data = await response.json();
      const aiResponse = data.response || 'Thank you for sharing your reflection.';

      const finalizedInteraction: JournalInteraction = {
        ...tempInteraction,
        geminiResponse: aiResponse,
        updatedAt: Date.now(),
      };

      // 1. Save interaction to Firestore under /users/{uid}/interactions/{id}
      await saveInteraction(user.uid, finalizedInteraction);

      // 2. Update local state
      const updatedInteractions = [...interactions, finalizedInteraction];
      setInteractions(updatedInteractions);

      // 3. Update parent session record in Firestore
      const updatedSession: JournalSession = {
        ...activeSession,
        mood: mood || activeSession.mood,
        interactionsCount: updatedInteractions.length,
        previewSnippet: text.slice(0, 100),
        updatedAt: Date.now(),
      };
      await saveSession(user.uid, updatedSession);

      setActiveSession(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      setSaveStatus('saved');
      setLastSaveError(null);

      // Automatically generate summary if milestone reached (e.g. 3 turns) and no summary yet
      if (updatedInteractions.length >= 3 && !activeSession.summary) {
        handleGenerateSummary(updatedInteractions, updatedSession);
      }
    } catch (err: any) {
      console.error('[Send Reflection Error]:', err);
      setSaveStatus('error');
      setLastSaveError(err.message || 'Error communicating with Gemini or Firestore.');
      
      // Preserve the user's prompt in interaction history with an error message
      const errorInteraction: JournalInteraction = {
        ...tempInteraction,
        geminiResponse: `⚠️ *Notice: Could not connect to Gemini service (${err.message || 'Network error'}). Your reflection prompt has been recorded locally.*`,
      };
      setInteractions((prev) => [...prev, errorInteraction]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // 8. Generate Session Summary & Insights
  const handleGenerateSummary = async (
    targetInteractions = interactions,
    targetSession = activeSession
  ) => {
    if (!user || !targetSession || targetInteractions.length === 0) return;

    setIsGeneratingSummary(true);
    try {
      const messages = targetInteractions.flatMap((item) => [
        { role: 'user' as const, content: item.userPrompt },
        { role: 'model' as const, content: item.geminiResponse },
      ]);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          existingTitle: targetSession.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const summaryData: SessionSummaryData = data.summary;

      const updatedSession: JournalSession = {
        ...targetSession,
        title: summaryData.title || targetSession.title,
        mood: summaryData.mood || targetSession.mood,
        summary: summaryData,
        updatedAt: Date.now(),
      };

      // Persist summary to Firestore
      await saveSession(user.uid, updatedSession);

      setActiveSession(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      setIsSummaryPanelOpen(true);
      setIsInsightsPanelOpen(false);
    } catch (err: any) {
      console.error('[Generate Summary Error]:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // 9. Generate Reflection Insights (Key Insight, Emotional Pattern, Recurring Theme, Action, Growth Signal)
  const handleGenerateInsights = async (
    targetInteractions = interactions,
    targetSession = activeSession
  ) => {
    if (!user || !targetSession || targetInteractions.length === 0) return;

    setIsGeneratingInsights(true);
    setInsightsError(null);
    try {
      const messages = targetInteractions.flatMap((item) => [
        { role: 'user' as const, content: item.userPrompt },
        { role: 'model' as const, content: item.geminiResponse },
      ]);

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          sessionTitle: targetSession.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate Reflection Insights');
      }

      const data = await response.json();
      const insightsData: ReflectionInsightsData = data.insights;

      const updatedSession: JournalSession = {
        ...targetSession,
        insights: insightsData,
        updatedAt: Date.now(),
      };

      // Persist to user's isolated Firestore database
      await saveSession(user.uid, updatedSession);
      await saveSessionInsights(user.uid, updatedSession.id, insightsData);

      setActiveSession(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      setIsInsightsPanelOpen(true);
      setIsSummaryPanelOpen(false);
    } catch (err: any) {
      console.error('[Generate Insights Error]:', err);
      setInsightsError(err.message || 'Failed to generate Reflection Insights.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // 10. Export all personal data as JSON archive
  const handleExportAll = async () => {
    if (!user) return;
    try {
      const allExportData: Array<{
        session: JournalSession;
        interactions: JournalInteraction[];
      }> = [];

      for (const s of sessions) {
        const sInteractions = await getInteractions(user.uid, s.id);
        allExportData.push({
          session: s,
          interactions: sInteractions,
        });
      }

      const blob = new Blob(
        [
          JSON.stringify(
            {
              exportDate: new Date().toISOString(),
              userId: user.uid,
              userEmail: user.email,
              totalSessions: allExportData.length,
              journal: allExportData,
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-gemini-journal-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('[Export Error]:', err);
      alert('Failed to export journal archive.');
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
      
      {/* Left Sidebar: Saved Sessions History */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={(s) => {
          setActiveSession(s);
          setIsSidebarMobileOpen(false);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onExportAll={handleExportAll}
        isLoading={isLoadingSessions}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* Central Conversation / Reflection Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <ChatArea
          currentSession={activeSession}
          interactions={interactions}
          onSendMessage={handleSendMessage}
          onUpdateSessionTitle={handleUpdateSessionTitle}
          onSelectMood={handleSelectMood}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          onToggleSummaryPanel={() => {
            const nextState = !isSummaryPanelOpen;
            setIsSummaryPanelOpen(nextState);
            if (nextState) setIsInsightsPanelOpen(false);
          }}
          isSummaryPanelOpen={isSummaryPanelOpen}
          onToggleInsightsPanel={() => {
            const nextState = !isInsightsPanelOpen;
            setIsInsightsPanelOpen(nextState);
            if (nextState) setIsSummaryPanelOpen(false);
          }}
          isInsightsPanelOpen={isInsightsPanelOpen}
          isLoadingAi={isLoadingAi}
          saveStatus={saveStatus}
          lastSaveError={lastSaveError}
          onRetrySave={() => {
            if (interactions.length > 0 && activeSession) {
              const last = interactions[interactions.length - 1];
              handleSendMessage(last.userPrompt, last.mood || 'Reflective');
            }
          }}
        />
      </main>

      {/* Right Collapsible Panel: Session Summary & Synthesis */}
      {isSummaryPanelOpen && (
        <aside className="fixed inset-y-0 right-0 z-30 pt-[65px] md:pt-0 md:static md:z-auto animate-in slide-in-from-right duration-200 shadow-xl md:shadow-none">
          <SummaryPanel
            summary={activeSession?.summary}
            isGenerating={isGeneratingSummary}
            onGenerateSummary={() => handleGenerateSummary()}
            onClose={() => setIsSummaryPanelOpen(false)}
            hasMessages={interactions.length > 0}
          />
        </aside>
      )}

      {/* Right Collapsible Panel: Reflection Insights */}
      {isInsightsPanelOpen && (
        <aside className="fixed inset-y-0 right-0 z-30 pt-[65px] md:pt-0 md:static md:z-auto animate-in slide-in-from-right duration-200 shadow-xl md:shadow-none">
          <ReflectionInsightsPanel
            insights={activeSession?.insights}
            isGenerating={isGeneratingInsights}
            onGenerateInsights={() => handleGenerateInsights()}
            onClose={() => setIsInsightsPanelOpen(false)}
            hasMessages={interactions.length > 0}
            error={insightsError}
          />
        </aside>
      )}

    </div>
  );
}
