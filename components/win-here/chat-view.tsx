"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, X, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionCTA } from "@/components/prospects/session-cta";
import { Scratchpad } from "@/components/win-here/scratchpad";
import { StarterChips } from "@/components/win-here/starter-chips";
import {
  DEFAULT_SCRATCHPAD,
  type WinHereMessage,
  type WinHereScratchpad,
} from "@/lib/types/win-here";

const STORAGE_KEY = "win-here-session-v1";

interface PersistedState {
  prospectId: string | null;
  sessionId: string | null;
  messages: WinHereMessage[];
  scratchpad: WinHereScratchpad;
}

interface ScratchpadDelta {
  siteName?: string;
  domainExpertise?: string;
  pains?: string[];
  preferredWork?: string[];
  acuteness?: "low" | "medium" | "high";
  readiness?: { verdict: "exploring" | "warming" | "ready"; rationale: string };
  starters?: string[];
  canvassed?: boolean;
}

function applyDelta(
  current: WinHereScratchpad,
  delta: ScratchpadDelta
): WinHereScratchpad {
  return {
    siteName: delta.siteName ?? current.siteName,
    domainExpertise: delta.domainExpertise ?? current.domainExpertise,
    pains: delta.pains ?? current.pains,
    preferredWork: delta.preferredWork ?? current.preferredWork,
    acuteness: delta.acuteness ?? current.acuteness,
    readiness: delta.readiness ?? current.readiness,
    starters: delta.starters ?? current.starters,
    canvassed: delta.canvassed ?? current.canvassed,
  };
}

function ChatBubble({ message }: { message: WinHereMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[90%] md:max-w-[80%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div
        className={cn(
          "px-5 py-3.5 rounded-2xl text-[15px] md:text-base leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-100 text-slate-700 border border-slate-200 rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[90%] mr-auto">
      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-blue-600" />
      </div>
      <div className="px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 rounded-bl-md">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export function WinHereChatView() {
  const [messages, setMessages] = useState<WinHereMessage[]>([]);
  const [scratchpad, setScratchpad] = useState<WinHereScratchpad>(DEFAULT_SCRATCHPAD);
  const [prospectId, setProspectId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const [mobileScratchpadOpen, setMobileScratchpadOpen] = useState(false);

  const hydratedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    let restored = false;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
          setScratchpad(parsed.scratchpad || DEFAULT_SCRATCHPAD);
          setProspectId(parsed.prospectId);
          setSessionId(parsed.sessionId);
          restored = parsed.messages.length > 0;
        }
      }
    } catch {
      // ignore corrupted state
    }

    const bootstrap = async () => {
      try {
        const res = await fetch("/api/win-here/session", { method: "POST" });
        const data = await res.json();
        if (data.prospectId) setProspectId(data.prospectId);
        if (data.sessionId) setSessionId(data.sessionId);

        if (!restored) {
          await sendMessage("", {
            forceHistory: [],
            forceProspectId: data.prospectId,
            forceSessionId: data.sessionId,
          });
        }
      } catch (err) {
        console.error("Failed to bootstrap session:", err);
        if (!restored) {
          setMessages([
            {
              id: "opening-fallback",
              role: "assistant",
              content:
                "hey — ok, first things first. what's your site? or just your company name. i want to know who i'm talking to before i start guessing at your world.",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const state: PersistedState = { prospectId, sessionId, messages, scratchpad };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or disabled
    }
  }, [prospectId, sessionId, messages, scratchpad]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = useCallback(
    async (
      text: string,
      opts?: {
        forceHistory?: WinHereMessage[];
        forceProspectId?: string | null;
        forceSessionId?: string | null;
      }
    ) => {
      const trimmed = text.trim();
      const isOpening = !trimmed && (opts?.forceHistory?.length === 0);
      if (!trimmed && !isOpening) return;

      let nextHistory = opts?.forceHistory ?? messages;
      if (trimmed) {
        const userTurn: WinHereMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: trimmed,
          timestamp: new Date().toISOString(),
        };
        nextHistory = [...nextHistory, userTurn];
        setMessages(nextHistory);
        setInput("");
      }
      setIsSending(true);

      try {
        const res = await fetch("/api/win-here/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: opts?.forceHistory ?? messages,
            scratchpad,
            prospectId: opts?.forceProspectId ?? prospectId,
            sessionId: opts?.forceSessionId ?? sessionId,
          }),
        });
        const data = await res.json();
        const content: string = data.content || "…";
        const delta: ScratchpadDelta = data.delta || {};

        const assistantTurn: WinHereMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantTurn]);
        setScratchpad((prev) => applyDelta(prev, delta));
      } catch (err) {
        console.error("chat send failed:", err);
        const errorTurn: WinHereMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "ok — something hiccuped on my end. try that one more time?",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorTurn]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, scratchpad, prospectId, sessionId]
  );

  const handleSend = () => {
    if (isSending) return;
    sendMessage(input);
  };

  const handleStarterPick = (text: string) => {
    if (isSending) return;
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showStarters =
    !isSending &&
    scratchpad.starters.length > 0 &&
    (userMessageCount === 0 || userMessageCount <= 2);

  const showCTA = scratchpad.readiness.verdict === "ready";

  const mobileSummaryBits: string[] = [];
  if (scratchpad.siteName) mobileSummaryBits.push(scratchpad.siteName);
  if (scratchpad.pains.length)
    mobileSummaryBits.push(`${scratchpad.pains.length} pain${scratchpad.pains.length > 1 ? "s" : ""}`);
  if (scratchpad.preferredWork.length)
    mobileSummaryBits.push(`${scratchpad.preferredWork.length} goal${scratchpad.preferredWork.length > 1 ? "s" : ""}`);
  const mobileSummary = mobileSummaryBits.join(" · ") || "tap to see what i'm hearing";

  return (
    <div className="w-full min-h-[100dvh] bg-white text-slate-800 relative overflow-x-clip">
      {/* Soft ambient gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/60 to-transparent" />
      <div className="pointer-events-none absolute top-32 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-10 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-5">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-xs font-medium uppercase tracking-wider">
              Live with <span className="gold-accent font-bold">Salience</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            <span className="text-slate-900">How do i get my </span>
            <span className="gold-accent">time</span>
            <br />
            <span className="text-slate-900">and energy back?</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Tell me about your week. I&apos;ll canvass your business, find what&apos;s
            eating your day, and show you what we can actually take off your plate.
          </p>
        </div>

        {/* Mobile scratchpad summary bar */}
        <button
          type="button"
          onClick={() => setMobileScratchpadOpen(true)}
          className="lg:hidden w-full flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Live read</div>
              <div className="text-sm text-slate-700 truncate">{mobileSummary}</div>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left rail: scratchpad (desktop) */}
          <aside className="hidden lg:block lg:w-[320px] lg:shrink-0">
            <div className="sticky top-28">
              <Scratchpad data={scratchpad} />
            </div>
          </aside>

          {/* Chat column */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-h-[70vh] lg:min-h-[75vh]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && !isSending && (
                  <div className="flex items-center justify-center h-full text-center text-slate-400 text-sm italic">
                    starting up...
                  </div>
                )}
                {messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
                {isSending && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Starter chips */}
              {showStarters && (
                <div className="px-4 md:px-6 pb-3 pt-1">
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                    or start with
                  </div>
                  <StarterChips
                    starters={scratchpad.starters}
                    onPick={handleStarterPick}
                    disabled={isSending}
                  />
                </div>
              )}

              {/* Input */}
              <div className="border-t border-slate-200 p-3 md:p-4 bg-slate-50/50">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="type what's on your mind..."
                    disabled={isSending}
                    rows={1}
                    className={cn(
                      "flex-1 resize-none outline-none rounded-2xl px-4 py-3",
                      "bg-white border border-slate-200",
                      "placeholder:text-slate-400 text-[15px] text-slate-800",
                      "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200",
                      "min-h-[52px] max-h-[140px]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || !input.trim()}
                    className={cn(
                      "shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200",
                      "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
                      "hover:from-blue-400 hover:to-blue-600",
                      "active:scale-95",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-500"
                    )}
                    aria-label="Send"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {showCTA && (
              <div className="mt-8">
                <SessionCTA />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile scratchpad drawer */}
      {mobileScratchpadOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileScratchpadOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10">
              <div className="text-sm font-semibold text-slate-800">Live read</div>
              <button
                type="button"
                onClick={() => setMobileScratchpadOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <Scratchpad data={scratchpad} className="bg-transparent border-0 p-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
