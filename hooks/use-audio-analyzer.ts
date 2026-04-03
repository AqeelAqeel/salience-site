"use client";

import { useRef, useEffect, useState } from "react";
import type { AnalyzerData } from "@/lib/types/prospects";

export function useAudioAnalyzer(stream: MediaStream | null) {
  const [analyzerData, setAnalyzerData] = useState<AnalyzerData | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<AnalyzerData>({ amplitude: 0, frequencyBands: [0, 0, 0, 0] });

  useEffect(() => {
    if (!stream) {
      setAnalyzerData(null);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    contextRef.current = audioContext;
    analyserRef.current = analyser;

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeDomainData = new Uint8Array(analyser.fftSize);
    const binCount = analyser.frequencyBinCount; // 128 bins

    function tick() {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeDomainData);

      // RMS amplitude from time-domain data
      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        const normalized = (timeDomainData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const amplitude = Math.sqrt(sumSquares / timeDomainData.length);

      // 4 frequency bands: sub-bass, bass, mid, treble
      const bandSize = Math.floor(binCount / 4);
      const bands: number[] = [];
      for (let b = 0; b < 4; b++) {
        let sum = 0;
        const start = b * bandSize;
        const end = Math.min(start + bandSize, binCount);
        for (let i = start; i < end; i++) {
          sum += frequencyData[i];
        }
        bands.push(sum / ((end - start) * 255));
      }

      dataRef.current = { amplitude, frequencyBands: bands };
      setAnalyzerData({ ...dataRef.current });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      audioContext.close();
      contextRef.current = null;
      analyserRef.current = null;
    };
  }, [stream]);

  return { analyzerData, isActive: !!stream };
}
