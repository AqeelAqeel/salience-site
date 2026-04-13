"use client";

import { useState } from "react";
import { PanelLeftOpen, Mic, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import FooterSpotlight from "@/components/footer-spotlight";
import { SessionSidebar } from "@/components/charton/session-sidebar";
import { ContextCardsRow } from "@/components/charton/context-cards-row";
import { SystemPromptViewer } from "@/components/charton/system-prompt-viewer";
import { PresetQuestions } from "@/components/charton/preset-questions";
import { ChatInterface } from "@/components/charton/chat-interface";
import { useChartonSession } from "@/hooks/use-charton-session";
import { useLocalUserId } from "@/hooks/use-local-user-id";
import { IntakeConversation } from "@/components/prospects/intake-conversation";

type Mode = "intake" | "chat";

export default function ChartonFinancialPage() {
  const [mode, setMode] = useState<Mode>("intake");
  const userId = useLocalUserId();
  const charton = useChartonSession(userId, mode === "chat");

  if (!userId) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <Navbar />

      {/* Admin mode toggle */}
      <div className="fixed top-20 right-4 z-30 flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-0.5 shadow-sm">
        <button
          onClick={() => setMode("intake")}
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            mode === "intake"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          )}
          title="Interview mode"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setMode("chat")}
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            mode === "chat"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          )}
          title="Admin chat mode"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {mode === "intake" ? (
        <main className="flex-1 pt-16 md:pt-20">
          <IntakeConversation />
        </main>
      ) : (
        <>
          <button
            onClick={charton.toggleSidebar}
            className={cn(
              "fixed top-20 left-3 z-30 md:hidden",
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-white border border-slate-200 shadow-sm",
              "text-slate-500 hover:text-blue-600 hover:border-blue-300",
              "transition-all duration-200"
            )}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          <main className="flex-1 flex pt-16 md:pt-20">
            <SessionSidebar
              sessions={charton.sessions}
              activeSessionId={charton.activeSessionId}
              isOpen={charton.sidebarOpen}
              onToggle={charton.toggleSidebar}
              onCreateSession={charton.createSession}
              onSwitchSession={charton.switchSession}
            />

            <div className="flex-1 flex flex-col min-h-0 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)]">
              {charton.isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <ContextCardsRow
                    cards={charton.contextCards}
                    onUpdate={charton.updateCard}
                  />
                  <SystemPromptViewer prompt={charton.systemPrompt} />
                  <PresetQuestions
                    onSelect={charton.sendMessage}
                    visible={
                      charton.messages.filter((m) => m.role !== "system")
                        .length === 0
                    }
                  />
                  <ChatInterface
                    messages={charton.messages}
                    isSending={charton.isSending}
                    onSend={charton.sendMessage}
                  />
                </>
              )}
            </div>
          </main>
        </>
      )}

      <FooterSpotlight />
    </div>
  );
}
