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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const friend = await getFriendBySlug(slug);
  if (!friend) {
    return new Response("friend not found", { status: 404 });
  }

  const token = await getGmailToken(friend.id);
  if (!token) {
    return new Response("no gmail tokens linked yet", { status: 412 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(toSSE(event)));
        } catch {
          /* controller closed */
        }
      };

      try {
        await runSync({ friend, token, emit });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "sync failed unexpectedly";
        emit({ type: "error", message });
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
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
