import { NextRequest } from "next/server";
import { getGmailToken } from "@/lib/friends/db";
import { runSync } from "@/lib/friends/sync";
import { isAuthFailure, requireFriendOwner } from "@/lib/friends/auth";
import type { StreamEvent } from "@/lib/friends/types";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function toSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function sseResponse(events: StreamEvent[]): Response {
  return new Response(events.map(toSSE).join(""), {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function preflightMissingEnv(): string | null {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY)
    missing.push("NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  return missing.length ? missing.join(", ") : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const missing = preflightMissingEnv();
  if (missing) {
    return sseResponse([
      {
        type: "error",
        message: `server is missing env vars: ${missing}. See docs/inbox-triager/configuration.md.`,
      },
    ]);
  }

  // Auth gate. EventSource can't set headers, so the cockpit appends
  // ?access_token=<jwt>. requireFriendOwner picks it up from there.
  const auth = await requireFriendOwner(req, slug);
  if (isAuthFailure(auth)) {
    return sseResponse([{ type: "error", message: auth.message }]);
  }
  const { friend } = auth;

  let token;
  try {
    token = await getGmailToken(friend.id);
  } catch (err) {
    return sseResponse([
      {
        type: "error",
        message: `failed to read gmail token: ${err instanceof Error ? err.message : "unknown"}`,
      },
    ]);
  }
  if (!token) {
    return sseResponse([
      {
        type: "error",
        message:
          "no gmail tokens linked yet — sign in with Google first, then resync.",
      },
    ]);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const safeClose = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      const emit = (event: StreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(toSSE(event)));
        } catch {
          closed = true;
        }
      };

      // Heartbeat — keeps Vercel's edge proxy from idle-closing the stream
      // during long OpenAI calls.
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          closed = true;
        }
      }, 15_000);

      try {
        await runSync({ friend, token, emit });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "sync failed unexpectedly";
        emit({ type: "error", message });
      } finally {
        clearInterval(heartbeat);
        setTimeout(safeClose, 50);
      }
    },
    cancel() {
      // Client navigated away or aborted.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
