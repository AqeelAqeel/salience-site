"use client";

import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types/charton";

interface ChatInterfaceProps {
  messages: Message[];
  isSending: boolean;
  onSend: (message: string) => void;
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-amber-500" />
        </div>
      )}
      <div
        className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-amber-500/15 text-white/90 border border-amber-500/20 rounded-br-md"
            : "bg-white/[0.05] text-white/80 border border-white/[0.08] rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-amber-500" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] rounded-bl-md">
        <div className="flex gap-1 py-1">
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (msg: string) => void;
  disabled: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef("");

  const handleSend = () => {
    const val = valueRef.current.trim();
    if (!val) return;
    onSend(val);
    valueRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    valueRef.current = e.target.value;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex items-end gap-3 p-4 border-t border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 resize-none outline-none rounded-2xl px-4 py-3",
          "bg-white/[0.05] border border-white/[0.08]",
          "placeholder:text-white/25 text-sm text-white/80",
          "focus:border-amber-500/30 focus:bg-white/[0.07] transition-all duration-200",
          "min-h-[48px] max-h-[120px]"
        )}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className={cn(
          "shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-gradient-to-r from-amber-500 to-amber-600 text-black",
          "hover:from-amber-400 hover:to-amber-500",
          "active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-amber-500"
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

export function ChatInterface({
  messages,
  isSending,
  onSend,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isSending && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-white/80 mb-2">
              Charton Financial AI
            </h3>
            <p className="text-sm text-white/40 max-w-md">
              Ask questions about how AI automations can benefit your financial
              services business. Edit the context cards above to personalize the
              conversation.
            </p>
          </div>
        )}

        {messages
          .filter((m) => m.role !== "system")
          .map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

        {isSending && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isSending} />
    </div>
  );
}
