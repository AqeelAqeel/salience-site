import { NextRequest } from "next/server";
import { getFriendBySlug, getGmailToken } from "@/lib/friends/db";
import { runSync } from "@/lib/friends/sync";
import type { StreamEvent } from "@/lib/friends/types";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function toSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
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
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const encoder = new TextEncoder();
  const respond = (events: StreamEvent[]) => {
    const body = events.map(toSSE).join("");
    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  };

  const missing = preflightMissingEnv();
  if (missing) {
    return respond([
      {
        type: "error",
        message: `server is missing env vars: ${missing}. The cockpit can't refresh Gmail tokens without GOOGLE_OAUTH_CLIENT_ID/SECRET; see docs/inbox-triager/configuration.md.`,
      },
    ]);
  }

  let friend;
  try {
    friend = await getFriendBySlug(slug);
  } catch (err) {
    return respond([
      {
        type: "error",
        message: `failed to load friend: ${err instanceof Error ? err.message : "unknown"}`,
      },
    ]);
  }
  if (!friend) {
    return respond([{ type: "error", message: `no friend at slug "${slug}"` }]);
  }

  let token;
  try {
    token = await getGmailToken(friend.id);
  } catch (err) {
    return respond([
      {
        type: "error",
        message: `failed to read gmail token: ${err instanceof Error ? err.message : "unknown"}`,
      },
    ]);
  }
  if (!token) {
    return respond([
      {
        type: "error",
        message:
          "no gmail tokens linked yet — sign in with Google first, then resync.",
      },
    ]);
  }

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

      // Heartbeat so EventSource doesn't time out on slow OpenAI calls.
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
        // Give the buffer a tick to flush before closing so the client sees
        // the final event instead of an abrupt drop ("connection lost").
        setTimeout(safeClose, 50);
      }
    },
    cancel() {
      // Client navigated away or aborted — nothing to do, controller is closed.
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
