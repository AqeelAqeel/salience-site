"use client";

import { PanelLeftOpen } from "lucide-react";
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

export default function ChartonFinancialPage() {
  const userId = useLocalUserId();
  const {
    sessions,
    activeSessionId,
    messages,
    contextCards,
    isLoading,
    isSending,
    sidebarOpen,
    systemPrompt,
    createSession,
    switchSession,
    sendMessage,
    updateCard,
    toggleSidebar,
  } = useChartonSession(userId);

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

      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
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
          sessions={sessions}
          activeSessionId={activeSessionId}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onCreateSession={createSession}
          onSwitchSession={switchSession}
        />

        <div className="flex-1 flex flex-col min-h-0 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <ContextCardsRow cards={contextCards} onUpdate={updateCard} />
              <SystemPromptViewer prompt={systemPrompt} />
              <PresetQuestions
                onSelect={sendMessage}
                visible={messages.filter((m) => m.role !== "system").length === 0}
              />
              <ChatInterface
                messages={messages}
                isSending={isSending}
                onSend={sendMessage}
              />
            </>
          )}
        </div>
      </main>

      <FooterSpotlight />
    </div>
  );
}
