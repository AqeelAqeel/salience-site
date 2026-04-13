"use client";

import { Plus, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types/charton";

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onCreateSession: () => void;
  onSwitchSession: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggle,
  onCreateSession,
  onSwitchSession,
}: SessionSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 md:z-auto",
          "top-0 left-0 h-full md:h-auto",
          "w-[280px] shrink-0",
          "bg-white border-r border-slate-200",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-600">Sessions</span>
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onCreateSession}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium",
              "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
              "hover:from-blue-400 hover:to-blue-600 transition-all",
              "active:scale-[0.98]"
            )}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSwitchSession(session.id)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                "hover:bg-slate-50",
                session.id === activeSessionId
                  ? "bg-blue-50 border-l-2 border-blue-500"
                  : "border-l-2 border-transparent"
              )}
            >
              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 truncate">
                  {session.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {timeAgo(session.updated_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
