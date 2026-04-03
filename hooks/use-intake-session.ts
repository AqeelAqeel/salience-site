"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAudioAnalyzer } from "./use-audio-analyzer";
import { useVoiceRecorder } from "./use-voice-recorder";
import type {
  IntakePhase,
  IntakeTurn,
  Prospect,
  ProspectSummary,
} from "@/lib/types/prospects";

export function useIntakeSession() {
  const [phase, setPhase] = useState<IntakePhase>("idle");
  const [turns, setTurns] = useState<IntakeTurn[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [summary, setSummary] = useState<ProspectSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const phaseRef = useRef<IntakePhase>("idle");
  const turnsRef = useRef<IntakeTurn[]>([]);
  const transcriptRef = useRef("");
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const prospectRef = useRef<Prospect | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  useEffect(() => {
    prospectRef.current = prospect;
  }, [prospect]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const typewriterReveal = useCallback(
    async (text: string): Promise<void> => {
      return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          if (i >= text.length || phaseRef.current !== "speaking") {
            clearInterval(interval);
            setCurrentResponse(text);
            resolve();
            return;
          }
          i += 2;
          setCurrentResponse(text.slice(0, i));
        }, 25);
      });
    },
    []
  );

  const playTTS = useCallback(async (text: string): Promise<void> => {
    try {
      const res = await fetch("/api/prospects/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          ttsAudioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          ttsAudioRef.current = null;
          resolve();
        };
        audio.play().catch(() => resolve());
      });
    } catch {
      // TTS is optional
    }
  }, []);

  const processUserTurn = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) {
        setPhase("listening");
        return;
      }

      setPhase("thinking");
      setCurrentTranscript("");

      const userTurn: IntakeTurn = {
        id: `user-${Date.now()}`,
        role: "user",
        content: transcript.trim(),
        timestamp: new Date().toISOString(),
        was_voice: true,
      };

      const updatedTurns = [...turnsRef.current, userTurn];
      setTurns(updatedTurns);
      turnsRef.current = updatedTurns;

      try {
        const res = await fetch("/api/prospects/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: transcript.trim(),
            history: turnsRef.current.slice(0, -1),
            prospectId: prospectRef.current?.id || null,
            sessionId: sessionIdRef.current || null,
          }),
        });

        const data = await res.json();
        const responseText = data.content || "Could you repeat that?";

        const assistantTurn: IntakeTurn = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: responseText,
          timestamp: new Date().toISOString(),
        };

        setTurns((prev) => [...prev, assistantTurn]);
        turnsRef.current = [...turnsRef.current, assistantTurn];

        setPhase("speaking");
        await typewriterReveal(responseText);
        await playTTS(responseText);

        if (phaseRef.current === "speaking") {
          setPhase("listening");
          setCurrentResponse("");
          transcriptRef.current = "";
          recorder.resumeRecording();
        }
      } catch (err) {
        console.error("Chat error:", err);
        setPhase("listening");
        setCurrentResponse("");
        recorder.resumeRecording();
      }
    },
    [typewriterReveal, playTTS]
  );

  const handleTranscript = useCallback((text: string) => {
    transcriptRef.current =
      (transcriptRef.current ? transcriptRef.current + " " : "") + text;
    setCurrentTranscript(transcriptRef.current);
  }, []);

  const handleSilence = useCallback(() => {
    if (phaseRef.current !== "listening") return;
    const transcript = transcriptRef.current;
    if (!transcript.trim()) return;

    recorder.pauseRecording();
    processUserTurn(transcript);
  }, [processUserTurn]);

  const recorder = useVoiceRecorder({
    onTranscript: handleTranscript,
    onSilenceDetected: handleSilence,
    silenceThreshold: 0.015,
    silenceDuration: 1800,
  });

  const { analyzerData } = useAudioAnalyzer(recorder.stream);

  // Set prospect context
  const setProspectContext = useCallback((p: Prospect) => {
    setProspect(p);
    prospectRef.current = p;
  }, []);

  const startInterview = useCallback(async () => {
    setTurns([]);
    setCurrentTranscript("");
    setCurrentResponse("");
    setSummary(null);
    transcriptRef.current = "";
    turnsRef.current = [];

    // Create a session in Supabase if we have a prospect
    if (prospectRef.current?.id) {
      try {
        const res = await fetch("/api/prospects/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectId: prospectRef.current.id,
            sessionType: "intake",
          }),
        });
        const data = await res.json();
        if (data.session) {
          setSessionId(data.session.id);
          sessionIdRef.current = data.session.id;
        }
      } catch (err) {
        console.error("Create session error:", err);
      }
    }

    await recorder.startRecording();
    setPhase("listening");

    // Send initial greeting
    try {
      const prospectName = prospectRef.current?.full_name;
      const greetingMsg = prospectName
        ? `[System: The prospect "${prospectName}" has just started the interview. Greet them by name warmly and ask your first question. You have context about them already loaded.]`
        : `[System: The prospect has just started the interview. Greet them warmly and ask your first question about their business.]`;

      const res = await fetch("/api/prospects/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: greetingMsg,
          history: [],
          prospectId: prospectRef.current?.id || null,
          sessionId: sessionIdRef.current || null,
        }),
      });

      const data = await res.json();
      const greeting = data.content || "Hi there! Tell me about your business.";

      const assistantTurn: IntakeTurn = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString(),
      };

      setTurns([assistantTurn]);
      turnsRef.current = [assistantTurn];

      recorder.pauseRecording();
      setPhase("speaking");
      await typewriterReveal(greeting);
      await playTTS(greeting);

      setPhase("listening");
      setCurrentResponse("");
      transcriptRef.current = "";
      recorder.resumeRecording();
    } catch {
      // If greeting fails, just start listening
    }
  }, [recorder, typewriterReveal, playTTS]);

  const stopInterview = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    recorder.stopRecording();
    setPhase("idle");
    setCurrentTranscript("");
    setCurrentResponse("");
    transcriptRef.current = "";

    // Mark session as completed
    if (sessionIdRef.current) {
      fetch(`/api/prospects/sessions/${sessionIdRef.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      }).catch(() => {});
    }
  }, [recorder]);

  const generateSummary = useCallback(async () => {
    if (turnsRef.current.length === 0) return;
    setIsGeneratingSummary(true);

    try {
      const res = await fetch("/api/prospects/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: turnsRef.current }),
      });

      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);

        // Also save summary to session
        if (sessionIdRef.current) {
          fetch(`/api/prospects/sessions/${sessionIdRef.current}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              summary_json: data.summary,
              status: "completed",
            }),
          }).catch(() => {});
        }

        // Update prospect with extracted fields
        if (prospectRef.current?.id && data.summary) {
          fetch(`/api/prospects/${prospectRef.current.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ai_aspirations: data.summary.wantsAiFor || [],
              manual_processes: data.summary.manualProcesses || [],
              va_worthy_tasks: data.summary.vaWorthyTasks || [],
            }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error("Summary generation error:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, []);

  return {
    phase,
    turns,
    currentTranscript,
    currentResponse,
    summary,
    isGeneratingSummary,
    analyzerData,
    audioStream: recorder.stream,
    recorderError: recorder.error,
    isRecording: recorder.isRecording,
    prospect,
    sessionId,
    setProspectContext,
    startInterview,
    stopInterview,
    generateSummary,
  };
}
