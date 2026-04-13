"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, Mic, Square, User, ImageUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntakeSession } from "@/hooks/use-intake-session";
import { ProspectIntakeOrb } from "./prospect-intake-orb";
import { AvatarSession, type AvatarSessionHandle } from "./avatar-session";
import { IntakeSummary } from "./intake-summary";
import { SessionCTA } from "./session-cta";

type VisualMode = "orb" | "avatar";

export function IntakeConversation() {
  const avatarRef = useRef<AvatarSessionHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>("orb");
  const [avatarFace, setAvatarFace] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState("idle");

  const {
    phase,
    turns,
    currentTranscript,
    currentResponse,
    summary,
    isGeneratingSummary,
    analyzerData,
    recorderError,
    startInterview,
    stopInterview,
    generateSummary,
    prospect,
    sessionId,
    setAvatarPublishAudio,
  } = useIntakeSession();

  const [showSummary, setShowSummary] = useState(true);

  const interviewEnded = phase === "idle" && turns.length > 0;
  const canShowSummaryButton =
    interviewEnded && !summary && !isGeneratingSummary;

  const handleAvatarImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a PNG, JPEG, or WebP image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be under 10MB.");
        return;
      }

      setAvatarFace(file);
      setVisualMode("avatar");

      const url = URL.createObjectURL(file);
      setFacePreview(url);
    },
    []
  );

  const handleAvatarStart = useCallback(async () => {
    if (!avatarFace || !avatarRef.current) return;

    setAvatarPublishAudio(() => async (audioBlob: Blob) => {
      if (avatarRef.current?.isConnected) {
        await avatarRef.current.publishAudio(audioBlob);
      }
    });

    await avatarRef.current.connect(avatarFace);
    await startInterview();
  }, [avatarFace, startInterview, setAvatarPublishAudio]);

  const handleStop = useCallback(async () => {
    stopInterview();
    if (visualMode === "avatar" && avatarRef.current?.isConnected) {
      await avatarRef.current.disconnect();
    }
    setAvatarPublishAudio(null);
  }, [stopInterview, visualMode, setAvatarPublishAudio]);

  const handleSwitchToOrb = useCallback(() => {
    setVisualMode("orb");
    setAvatarFace(null);
    if (facePreview) {
      URL.revokeObjectURL(facePreview);
      setFacePreview(null);
    }
  }, [facePreview]);

  let displayText = "";
  let displaySubtext = "";

  if (phase === "idle" && turns.length === 0) {
    displayText = "Ready when you are.";
    displaySubtext =
      "Start a conversation to explore how AI can work for your business.";
  } else if (phase === "listening") {
    displayText = currentTranscript || "";
    displaySubtext = currentTranscript ? "" : "Listening...";
  } else if (phase === "thinking") {
    displayText = "";
    displaySubtext = "";
  } else if (phase === "speaking") {
    displayText = currentResponse;
  }

  const notStarted = phase === "idle" && turns.length === 0;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center px-6 overflow-y-auto",
        interviewEnded
          ? "justify-start pt-12 pb-20 min-h-[calc(100dvh-5rem)]"
          : "justify-center min-h-[calc(100dvh-5rem)]"
      )}
    >
      {/* Visualizer */}
      <div
        className={cn(
          "relative shrink-0 transition-all duration-700",
          interviewEnded
            ? "w-[160px] h-[160px] md:w-[200px] md:h-[200px]"
            : "w-[300px] h-[300px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]"
        )}
      >
        {visualMode === "orb" ? (
          <ProspectIntakeOrb
            phase={phase}
            analyzerData={analyzerData}
            className="absolute inset-0"
          />
        ) : (
          <>
            {avatarStatus !== "connected" && facePreview && notStarted ? (
              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-blue-300">
                <img
                  src={facePreview}
                  alt="Avatar face"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
              </div>
            ) : null}
            <AvatarSession
              ref={avatarRef}
              className={cn(
                "absolute inset-0",
                avatarStatus !== "connected" && notStarted && facePreview
                  ? "opacity-0"
                  : "opacity-100"
              )}
              onStatusChange={setAvatarStatus}
            />
          </>
        )}

        {phase === "thinking" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Main text */}
      {!interviewEnded && (
        <div className="w-full max-w-2xl mx-auto text-center mt-8 min-h-[120px] px-4">
          {displayText && (
            <p
              className={cn(
                "text-xl md:text-2xl lg:text-3xl leading-relaxed font-light tracking-wide",
                phase === "speaking"
                  ? "text-slate-800"
                  : phase === "listening"
                    ? "text-slate-600"
                    : "text-slate-500"
              )}
            >
              {displayText}
              {(phase === "listening" && currentTranscript) ||
              phase === "speaking" ? (
                <span className="inline-block w-0.5 h-6 md:h-7 bg-blue-500 ml-1.5 animate-pulse align-text-bottom" />
              ) : null}
            </p>
          )}

          {displaySubtext && (
            <p className="text-base md:text-lg text-slate-400 mt-3">
              {displaySubtext}
            </p>
          )}

          {phase === "listening" && !currentTranscript && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/40" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {recorderError && (
        <div className="mt-6 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm max-w-md text-center">
          {recorderError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleAvatarImageSelect}
      />

      {/* Controls */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {notStarted && (
          <div className="flex items-center gap-4">
            {visualMode === "orb" ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "group px-6 py-5 rounded-full",
                  "bg-slate-50 border border-slate-200",
                  "text-slate-400 font-medium text-base",
                  "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300",
                  "active:scale-[0.97] transition-all duration-200",
                  "flex items-center gap-3"
                )}
                title="Upload a face image to use a live avatar"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Avatar</span>
              </button>
            ) : (
              <button
                onClick={handleSwitchToOrb}
                className={cn(
                  "group px-6 py-5 rounded-full",
                  "bg-slate-50 border border-slate-200",
                  "text-slate-400 font-medium text-base",
                  "hover:bg-slate-100 hover:text-slate-600",
                  "active:scale-[0.97] transition-all duration-200",
                  "flex items-center gap-3"
                )}
                title="Switch back to orb visualizer"
              >
                <ImageUp className="w-5 h-5" />
                <span className="hidden sm:inline">Orb</span>
              </button>
            )}

            <button
              onClick={visualMode === "avatar" ? handleAvatarStart : startInterview}
              disabled={visualMode === "avatar" && !avatarFace}
              className={cn(
                "group px-10 py-5 rounded-full",
                "bg-gradient-to-r from-blue-500 to-blue-700",
                "text-white font-semibold text-lg",
                "hover:from-blue-400 hover:to-blue-600",
                "active:scale-[0.97] transition-all duration-200",
                "shadow-lg shadow-blue-500/25",
                "flex items-center gap-3",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-700"
              )}
            >
              <Mic className="w-5 h-5" />
              Begin
            </button>
          </div>
        )}

        {notStarted && visualMode === "avatar" && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <ImageUp className="w-3 h-3" />
            Change face image
          </button>
        )}

        {phase !== "idle" && (
          <button
            onClick={handleStop}
            className={cn(
              "px-6 py-3 rounded-full",
              "bg-slate-50 border border-slate-200",
              "text-slate-500 text-sm",
              "hover:bg-slate-100 hover:text-slate-700",
              "active:scale-[0.97] transition-all duration-200",
              "flex items-center gap-2"
            )}
          >
            <Square className="w-3.5 h-3.5" />
            End
          </button>
        )}

        {canShowSummaryButton && (
          <button
            onClick={generateSummary}
            className={cn(
              "px-8 py-4 rounded-full",
              "bg-slate-50 border border-slate-200",
              "text-slate-600 text-sm font-medium",
              "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
              "active:scale-[0.97] transition-all duration-200",
              "flex items-center gap-2"
            )}
          >
            <FileText className="w-4 h-4" />
            View Summary
          </button>
        )}

        {isGeneratingSummary && (
          <div className="flex items-center gap-3 text-base text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            Generating your summary...
          </div>
        )}
      </div>

      {summary && showSummary && (
        <div className="mt-8 w-full max-w-lg">
          <IntakeSummary
            summary={summary}
            prospectId={prospect?.id}
            sessionId={sessionId}
            onClose={() => setShowSummary(false)}
          />
        </div>
      )}

      {interviewEnded && <SessionCTA className="mt-10" />}
    </div>
  );
}
