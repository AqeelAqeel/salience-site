"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void;
  onSilenceDetected: () => void;
  silenceThreshold?: number;
  silenceDuration?: number;
}

export function useVoiceRecorder({
  onTranscript,
  onSilenceDetected,
  silenceThreshold = 0.015,
  silenceDuration = 1800,
}: UseVoiceRecorderOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceCheckRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceAnalyserRef = useRef<AnalyserNode | null>(null);
  const hasSpokenRef = useRef(false);
  const chunksRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef(false);

  // Callbacks stored in refs to avoid re-creating recorder
  const onTranscriptRef = useRef(onTranscript);
  const onSilenceRef = useRef(onSilenceDetected);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onSilenceRef.current = onSilenceDetected;
  }, [onTranscript, onSilenceDetected]);

  const sendChunkForTranscription = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return; // skip tiny chunks
    isProcessingRef.current = true;
    try {
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");
      const res = await fetch("/api/prospects/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text && data.text.trim()) {
        onTranscriptRef.current(data.text.trim());
      }
    } catch (err) {
      console.error("Transcription chunk error:", err);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const startSilenceDetection = useCallback(
    (analyser: AnalyserNode) => {
      const timeDomainData = new Uint8Array(analyser.fftSize);

      function checkSilence() {
        analyser.getByteTimeDomainData(timeDomainData);
        let sumSquares = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const normalized = (timeDomainData[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / timeDomainData.length);

        if (rms > silenceThreshold) {
          hasSpokenRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasSpokenRef.current && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            onSilenceRef.current();
            silenceTimerRef.current = null;
          }, silenceDuration);
        }

        silenceCheckRef.current = requestAnimationFrame(checkSilence);
      }

      silenceCheckRef.current = requestAnimationFrame(checkSilence);
    },
    [silenceThreshold, silenceDuration]
  );

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      setStream(mediaStream);
      hasSpokenRef.current = false;
      chunksRef.current = [];

      // Set up silence detection
      const audioContext = new AudioContext();
      const silenceAnalyser = audioContext.createAnalyser();
      silenceAnalyser.fftSize = 2048;
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(silenceAnalyser);

      audioContextRef.current = audioContext;
      silenceAnalyserRef.current = silenceAnalyser;

      // MediaRecorder with chunked recording
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(mediaStream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          sendChunkForTranscription(e.data);
        }
      };

      recorder.start(3000); // 3-second chunks
      setIsRecording(true);
      startSilenceDetection(silenceAnalyser);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access and try again."
          : "Failed to start recording. Please check your microphone.";
      setError(message);
      console.error("Recording error:", err);
    }
  }, [sendChunkForTranscription, startSilenceDetection]);

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    cancelAnimationFrame(silenceCheckRef.current);

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    hasSpokenRef.current = false;
    chunksRef.current = [];
  }, [stream]);

  // Pause/resume recording (keeps stream alive for analyzer)
  const pauseRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    cancelAnimationFrame(silenceCheckRef.current);

    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    hasSpokenRef.current = false;
  }, []);

  const resumeRecording = useCallback(() => {
    if (!stream) return;

    hasSpokenRef.current = false;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        sendChunkForTranscription(e.data);
      }
    };

    recorder.start(3000);
    setIsRecording(true);

    if (silenceAnalyserRef.current) {
      startSilenceDetection(silenceAnalyserRef.current);
    }
  }, [stream, sendChunkForTranscription, startSilenceDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      cancelAnimationFrame(silenceCheckRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    stream,
    isRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
}
