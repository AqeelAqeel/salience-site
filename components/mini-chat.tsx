"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SCRATCHPAD,
  type WinHereMessage,
  type WinHereScratchpad,
} from "@/lib/types/win-here";
import Link from "next/link";

const STORAGE_KEY = "mini-chat-session-v1";

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

export function MiniChat() {
  const [messages, setMessages] = useState<WinHereMessage[]>([]);
  const [scratchpad, setScratchpad] = useState<WinHereScratchpad>(DEFAULT_SCRATCHPAD);
  const [prospectId, setProspectId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");

  const hydratedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bootstrap session + opening message
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    let restored = false;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setScratchpad(parsed.scratchpad || DEFAULT_SCRATCHPAD);
          setProspectId(parsed.prospectId);
          setSessionId(parsed.sessionId);
          restored = true;
        }
      }
    } catch {
      // ignore
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
        console.error("Mini chat bootstrap failed:", err);
        if (!restored) {
          setMessages([
            {
              id: "opening-fallback",
              role: "assistant",
              content:
                "hey! tell me a bit about your business and what's eating your time — i'll show you where AI can help.",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ prospectId, sessionId, messages, scratchpad })
      );
    } catch {
      // ignore
    }
  }, [prospectId, sessionId, messages, scratchpad]);

  // Auto scroll
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
      const isOpening = !trimmed && opts?.forceHistory?.length === 0;
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
        const content: string = data.content || "...";
        const delta: ScratchpadDelta = data.delta || {};

        const assistantTurn: WinHereMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantTurn]);
        setScratchpad((prev) => applyDelta(prev, delta));
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "something hiccuped on my end — try again?",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, scratchpad, prospectId, sessionId]
  );

  const handleSend = () => {
    if (isSending || !input.trim()) return;
    sendMessage(input);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Messages area */}
      <div className="h-[320px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isSending && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
            connecting...
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={cn(
                "flex gap-2.5 max-w-[88%]",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
              )}
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isUser
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-700 rounded-bl-md"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2.5 max-w-[88%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick starters — only before first user message */}
      {userCount === 0 && !isSending && messages.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {[
            "My week is 40% email and I'm drowning.",
            "I keep rebuilding the same spreadsheet.",
            "Can you actually help someone like me?",
          ].map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 p-3 flex items-end gap-2 bg-slate-50/50">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="type what's on your mind..."
          disabled={isSending}
          rows={1}
          className={cn(
            "flex-1 resize-none outline-none rounded-xl px-3.5 py-2.5",
            "bg-white border border-slate-200",
            "placeholder:text-slate-400 text-sm text-slate-800",
            "focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all",
            "min-h-[42px] max-h-[100px]"
          )}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          className={cn(
            "shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all",
            "bg-blue-600 text-white hover:bg-blue-700",
            "active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Expand link */}
      {userCount >= 2 && (
        <div className="px-4 py-2.5 border-t border-slate-100 text-center">
          <Link
            href="/i-want-my-time-and-energy-back"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Continue in full chat view &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
