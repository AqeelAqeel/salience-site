"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useAtlasSession } from "@northmodellabs/atlas-react";
import { cn } from "@/lib/utils";

export interface AvatarSessionHandle {
  connect: (face: File) => Promise<void>;
  disconnect: () => Promise<void>;
  publishAudio: (audio: string | Blob | ArrayBuffer) => Promise<void>;
  status: string;
  isConnected: boolean;
}

interface AvatarSessionProps {
  className?: string;
  onStatusChange?: (status: string) => void;
}

export const AvatarSession = forwardRef<AvatarSessionHandle, AvatarSessionProps>(
  function AvatarSession({ className, onStatusChange }, ref) {
    const session = useAtlasSession({
      createSession: async (face) => {
        const form = new FormData();
        if (face) form.append("face", face);
        form.append("mode", "passthrough");
        const res = await fetch("/api/atlas/session", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create avatar session");
        }
        const data = await res.json();
        return {
          sessionId: data.session_id,
          livekitUrl: data.livekit_url,
          token: data.token,
        };
      },
      deleteSession: async (id) => {
        await fetch(`/api/atlas/session/${id}`, { method: "DELETE" });
      },
      autoEnableMic: false,
    });

    const prevStatusRef = useRef(session.status);
    useEffect(() => {
      if (session.status !== prevStatusRef.current) {
        prevStatusRef.current = session.status;
        onStatusChange?.(session.status);
      }
    }, [session.status, onStatusChange]);

    useImperativeHandle(ref, () => ({
      connect: async (face: File) => {
        await session.connect(face);
      },
      disconnect: async () => {
        await session.disconnect();
      },
      publishAudio: async (audio: string | Blob | ArrayBuffer) => {
        await session.publishAudio(audio);
      },
      status: session.status,
      isConnected: session.status === "connected",
    }));

    return (
      <div
        className={cn(
          "relative w-full h-full rounded-full overflow-hidden bg-black/40",
          className
        )}
      >
        {/* LiveKit video renders into this div */}
        <div
          ref={session.videoRef}
          className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-full"
        />

        {/* Loading overlay */}
        {session.status === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error overlay */}
        {session.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <p className="text-red-400 text-xs text-center px-4">
              {session.error || "Avatar connection failed"}
            </p>
          </div>
        )}
      </div>
    );
  }
);
