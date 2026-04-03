"use client";

import { useState } from "react";
import { PanelLeftOpen, Mic, MessageSquare } from "lucide-react";
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
  const charton = useChartonSession(userId);

  if (!userId) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col">
      <Navbar />

      {/* Mode toggle */}
      <div className="fixed top-20 right-4 z-30 flex items-center gap-1 bg-[#141414] border border-white/[0.08] rounded-xl p-1">
        <button
          onClick={() => setMode("intake")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            mode === "intake"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              : "text-white/40 hover:text-white/60"
          )}
        >
          <Mic className="w-3 h-3" />
          Interview
        </button>
        <button
          onClick={() => setMode("chat")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            mode === "chat"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              : "text-white/40 hover:text-white/60"
          )}
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
      </div>

      {mode === "intake" ? (
        <main className="flex-1 pt-16 md:pt-20">
          <IntakeConversation />
        </main>
      ) : (
        <>
          {/* Mobile sidebar toggle */}
          <button
            onClick={charton.toggleSidebar}
            className={cn(
              "fixed top-20 left-3 z-30 md:hidden",
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-[#141414] border border-white/[0.08]",
              "text-white/50 hover:text-white/80 hover:border-amber-500/30",
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
                  <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
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
