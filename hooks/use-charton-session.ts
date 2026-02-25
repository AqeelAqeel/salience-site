"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Session, Message, ContextCard } from "@/lib/types/charton";
import { assembleSystemPrompt, DEFAULT_CARDS } from "@/lib/types/charton";

interface ChartonState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  contextCards: { title: string; body: string }[];
  isLoading: boolean;
  isSending: boolean;
  sidebarOpen: boolean;
}

export function useChartonSession(userId: string | null) {
  const [state, setState] = useState<ChartonState>({
    sessions: [],
    activeSessionId: null,
    messages: [],
    contextCards: DEFAULT_CARDS.map((c) => ({ title: c.title, body: c.body })),
    isLoading: true,
    isSending: false,
    sidebarOpen: false,
  });

  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  // Fetch sessions on mount
  useEffect(() => {
    if (!userId) return;

    async function loadSessions() {
      try {
        const res = await fetch(
          `/api/charton-financial/sessions?userId=${userId}`
        );
        const data = await res.json();
        const sessions: Session[] = data.sessions || [];

        if (sessions.length === 0) {
          // Auto-create first session
          const createRes = await fetch("/api/charton-financial/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
          const createData = await createRes.json();
          if (createData.session) {
            setState((s) => ({
              ...s,
              sessions: [createData.session],
              activeSessionId: createData.session.id,
              contextCards: (createData.cards || [])
                .sort(
                  (a: ContextCard, b: ContextCard) =>
                    a.card_index - b.card_index
                )
                .map((c: ContextCard) => ({ title: c.title, body: c.body })),
              messages: [],
              isLoading: false,
            }));
            return;
          }
        }

        // Load most recent session
        const activeId = sessions[0]?.id;
        setState((s) => ({
          ...s,
          sessions,
          activeSessionId: activeId,
        }));

        if (activeId) {
          await loadSession(activeId);
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
        setState((s) => ({ ...s, isLoading: false }));
      }
    }

    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadSession(sessionId: string) {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await fetch(
        `/api/charton-financial/sessions/${sessionId}`
      );
      const data = await res.json();

      const cards = (data.cards || [])
        .sort(
          (a: ContextCard, b: ContextCard) => a.card_index - b.card_index
        )
        .map((c: ContextCard) => ({ title: c.title, body: c.body }));

      // Ensure we always have 3 cards
      while (cards.length < 3) {
        cards.push({
          title: DEFAULT_CARDS[cards.length]?.title || "",
          body: DEFAULT_CARDS[cards.length]?.body || "",
        });
      }

      setState((s) => ({
        ...s,
        activeSessionId: sessionId,
        messages: data.messages || [],
        contextCards: cards,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Failed to load session:", err);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }

  const createSession = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/charton-financial/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.session) {
        const cards = (data.cards || [])
          .sort(
            (a: ContextCard, b: ContextCard) => a.card_index - b.card_index
          )
          .map((c: ContextCard) => ({ title: c.title, body: c.body }));

        setState((s) => ({
          ...s,
          sessions: [data.session, ...s.sessions],
          activeSessionId: data.session.id,
          messages: [],
          contextCards: cards.length === 3 ? cards : DEFAULT_CARDS.map((c) => ({ title: c.title, body: c.body })),
          sidebarOpen: false,
        }));
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, [userId]);

  const switchSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === state.activeSessionId) return;
      setState((s) => ({ ...s, sidebarOpen: false }));
      await loadSession(sessionId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeSessionId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.activeSessionId || !content.trim()) return;

      // Optimistic: add user message
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        session_id: state.activeSessionId,
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        messages: [...s.messages, tempUserMsg],
        isSending: true,
      }));

      try {
        const res = await fetch("/api/charton-financial/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: state.activeSessionId,
            message: content.trim(),
            contextCards: state.contextCards,
            messageHistory: state.messages
              .filter((m) => m.role !== "system")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();

        if (data.error) {
          console.error("Chat error:", data.error);
          setState((s) => ({ ...s, isSending: false }));
          return;
        }

        const assistantMsg: Message = {
          id: data.messageId || `assistant-${Date.now()}`,
          session_id: state.activeSessionId!,
          role: "assistant",
          content: data.content,
          created_at: new Date().toISOString(),
        };

        setState((s) => ({
          ...s,
          messages: [...s.messages, assistantMsg],
          isSending: false,
          // Update session title if first message
          sessions: s.messages.length <= 1
            ? s.sessions.map((sess) =>
                sess.id === s.activeSessionId
                  ? {
                      ...sess,
                      title:
                        content.length > 50
                          ? content.substring(0, 50) + "..."
                          : content,
                    }
                  : sess
              )
            : s.sessions,
        }));
      } catch (err) {
        console.error("Failed to send message:", err);
        setState((s) => ({ ...s, isSending: false }));
      }
    },
    [state.activeSessionId, state.contextCards, state.messages]
  );

  const updateCard = useCallback(
    (cardIndex: number, title: string, body: string) => {
      // Update locally immediately
      setState((s) => {
        const newCards = [...s.contextCards];
        newCards[cardIndex] = { title, body };
        return { ...s, contextCards: newCards };
      });

      // Debounce the API call
      if (debounceTimers.current[cardIndex]) {
        clearTimeout(debounceTimers.current[cardIndex]);
      }
      debounceTimers.current[cardIndex] = setTimeout(async () => {
        if (!state.activeSessionId) return;
        try {
          await fetch("/api/charton-financial/cards", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: state.activeSessionId,
              cardIndex,
              title,
              body,
            }),
          });
        } catch (err) {
          console.error("Failed to save card:", err);
        }
      }, 500);
    },
    [state.activeSessionId]
  );

  const toggleSidebar = useCallback(() => {
    setState((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
  }, []);

  const systemPrompt = assembleSystemPrompt(state.contextCards);

  return {
    ...state,
    systemPrompt,
    createSession,
    switchSession,
    sendMessage,
    updateCard,
    toggleSidebar,
  };
}
