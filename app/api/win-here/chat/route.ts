import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabase } from "@/lib/supabase";
import {
  WIN_HERE_TOOLS,
  assembleWinHereSystemPrompt,
  DEFAULT_SCRATCHPAD,
  type WinHereScratchpad,
  type WinHereMessage,
} from "@/lib/types/win-here";

const MODEL = "gpt-5.4-mini-2026-03-17";
const MAX_TOOL_ROUNDS = 4;

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Server-side tool executors ──────────────────────────────────────────

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed.replace(/^\/+/, "");
}

// Jina Reader: free, JS-rendered, returns markdown. No API key required.
// https://r.jina.ai/{url}
async function canvassWebsite(rawUrl: string): Promise<string> {
  const url = normalizeUrl(rawUrl);
  try {
    const readerUrl = "https://r.jina.ai/" + url;
    const res = await fetch(readerUrl, {
      headers: {
        // Ask for a concise response; Jina honors these hints.
        "X-Return-Format": "markdown",
        "Accept": "text/plain",
      },
      // 15s cap — fail fast rather than hanging the chat turn.
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return `[canvass failed: ${res.status} ${res.statusText}]`;
    }
    const text = await res.text();
    // Cap payload so we don't blow the context window on sprawling sites.
    const MAX_CHARS = 8000;
    if (text.length > MAX_CHARS) {
      return text.slice(0, MAX_CHARS) + "\n\n[...truncated]";
    }
    return text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[canvass failed: ${msg}]`;
  }
}

// ─── Scratchpad delta type returned to the client ────────────────────────

interface ScratchpadDelta {
  siteName?: string;
  domainExpertise?: string;
  pains?: string[];
  preferredWork?: string[];
  acuteness?: "low" | "medium" | "high";
  readiness?: { verdict: "exploring" | "warming" | "ready"; rationale: string };
  starters?: string[];
  canvassed?: boolean;
}

// ─── Main POST handler ───────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        content:
          "i'm having a hiccup connecting right now — give me a sec and try again.",
        delta: {},
        error: "OpenAI API key not configured",
      });
    }

    const {
      message,
      history,
      scratchpad,
      prospectId,
      sessionId,
    } = (await request.json()) as {
      message: string;
      history: WinHereMessage[];
      scratchpad: WinHereScratchpad;
      prospectId?: string | null;
      sessionId?: string | null;
    };

    // Allow empty message ONLY on the first turn (the client sends "" to get
    // the opening greeting). Any later empty is an error.
    const isOpening = !message && (!history || history.length === 0);
    if (!isOpening && !message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const currentScratchpad: WinHereScratchpad = scratchpad || DEFAULT_SCRATCHPAD;
    const delta: ScratchpadDelta = {};

    // Build the conversation for OpenAI
    const systemPrompt = assembleWinHereSystemPrompt(currentScratchpad);
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).map(
        (turn): OpenAI.ChatCompletionMessageParam => ({
          role: turn.role,
          content: turn.content,
        })
      ),
    ];
    if (!isOpening) {
      messages.push({ role: "user", content: message });
    } else {
      // Prime the model for an opening turn
      messages.push({
        role: "user",
        content:
          "[system note: this is the very first message of the session. the user just landed on the page. give your opening message now — warm, short, ask for their site.]",
      });
    }

    // Tool-calling loop: model may call multiple tools before producing
    // its final natural-language reply.
    let finalContent = "";
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: WIN_HERE_TOOLS,
        tool_choice: "auto",
        temperature: 0.85,
        max_tokens: 600,
      });

      const choice = response.choices[0]?.message;
      if (!choice) break;

      // Append the assistant's message (with any tool calls) to the history
      messages.push(choice as OpenAI.ChatCompletionMessageParam);

      const toolCalls = choice.tool_calls || [];
      if (toolCalls.length === 0) {
        finalContent = choice.content || "";
        break;
      }

      // Execute each tool call and feed results back
      for (const call of toolCalls) {
        if (call.type !== "function") continue;
        const name = call.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }

        let toolResult = "";

        switch (name) {
          case "set_website": {
            const url = String(args.url || "");
            const display = String(args.display_name || url);
            delta.siteName = display;
            toolResult = JSON.stringify({
              ok: true,
              normalized_url: normalizeUrl(url),
              display_name: display,
              note: "Site recorded in scratchpad. Call canvass_website next.",
            });
            break;
          }

          case "canvass_website": {
            const url = String(args.url || "");
            const markdown = await canvassWebsite(url);
            delta.canvassed = true;
            toolResult = JSON.stringify({
              ok: true,
              url: normalizeUrl(url),
              markdown,
              note:
                "Canvass complete. Use this to build a domain_expertise read and call record_domain_assessment.",
            });
            break;
          }

          case "record_domain_assessment": {
            const expertise = String(args.domain_expertise || "");
            const signals = Array.isArray(args.recent_signals)
              ? (args.recent_signals as string[])
              : [];
            const signalLine = signals.length
              ? " Recent signals: " + signals.join("; ")
              : "";
            delta.domainExpertise = expertise + signalLine;
            toolResult = JSON.stringify({
              ok: true,
              note: "Scratchpad updated. Consider calling propose_starters now.",
            });
            break;
          }

          case "record_pains": {
            const items = Array.isArray(args.items) ? (args.items as string[]) : [];
            const acuteness = String(args.acuteness || "") as
              | "low"
              | "medium"
              | "high"
              | "";
            delta.pains = items;
            if (acuteness === "low" || acuteness === "medium" || acuteness === "high") {
              delta.acuteness = acuteness;
            }
            toolResult = JSON.stringify({ ok: true });
            break;
          }

          case "record_preferred_work": {
            const items = Array.isArray(args.items) ? (args.items as string[]) : [];
            delta.preferredWork = items;
            toolResult = JSON.stringify({ ok: true });
            break;
          }

          case "propose_starters": {
            const starters = Array.isArray(args.starters)
              ? (args.starters as string[])
              : [];
            delta.starters = starters;
            toolResult = JSON.stringify({ ok: true });
            break;
          }

          case "assess_readiness": {
            const verdict = String(args.verdict || "") as
              | "exploring"
              | "warming"
              | "ready"
              | "";
            const rationale = String(args.rationale || "");
            if (verdict === "exploring" || verdict === "warming" || verdict === "ready") {
              delta.readiness = { verdict, rationale };
            }
            toolResult = JSON.stringify({ ok: true });
            break;
          }

          default:
            toolResult = JSON.stringify({ ok: false, error: "unknown tool" });
        }

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: toolResult,
        });
      }
    }

    // If we exhausted rounds without a final content, force one more call
    // without tools so the model must speak.
    if (!finalContent) {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.85,
        max_tokens: 400,
      });
      finalContent = response.choices[0]?.message?.content || "";
    }

    if (!finalContent) {
      finalContent = "hmm — can you say that again? i want to make sure i hear you right.";
    }

    // ─── Persist to Supabase (non-blocking on failure) ───────────────────
    // We persist both turns to prospect_turns, update turn_count on the
    // session, and mirror the scratchpad into the prospect row so it lands
    // in the existing CRM pipeline.
    if (sessionId && prospectId) {
      try {
        const supabase = getSupabase();

        // Compose merged scratchpad for prospect mirror
        const merged: WinHereScratchpad = {
          ...currentScratchpad,
          ...Object.fromEntries(
            Object.entries(delta).filter(([, v]) => v !== undefined)
          ),
        } as WinHereScratchpad;

        // Persist the user turn (if not the opening priming turn)
        const turns: Array<Record<string, unknown>> = [];
        if (!isOpening) {
          turns.push({
            session_id: sessionId,
            role: "user",
            content: message,
            was_voice: false,
          });
        }
        turns.push({
          session_id: sessionId,
          role: "assistant",
          content: finalContent,
          was_voice: false,
        });
        if (turns.length) {
          await supabase.from("prospect_turns").insert(turns);
        }

        // Update turn count
        const { count } = await supabase
          .from("prospect_turns")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);
        await supabase
          .from("prospect_sessions")
          .update({ turn_count: count || 0 })
          .eq("id", sessionId);

        // Mirror scratchpad into the prospect row
        const prospectUpdate: Record<string, unknown> = {};
        if (merged.siteName) {
          prospectUpdate.company_name = merged.siteName;
          prospectUpdate.website_url = merged.siteName;
        }
        if (merged.domainExpertise) {
          prospectUpdate.industry = merged.domainExpertise.slice(0, 200);
          prospectUpdate.meeting_notes = merged.domainExpertise;
        }
        if (merged.pains.length) {
          prospectUpdate.pain_points = merged.pains;
          prospectUpdate.manual_processes = merged.pains;
        }
        if (merged.preferredWork.length) {
          prospectUpdate.ai_aspirations = merged.preferredWork;
        }
        if (merged.acuteness) {
          prospectUpdate.priority =
            merged.acuteness === "high"
              ? "high"
              : merged.acuteness === "medium"
                ? "medium"
                : "low";
        }
        if (merged.readiness.verdict) {
          prospectUpdate.engagement_level =
            merged.readiness.verdict === "ready"
              ? "hot"
              : merged.readiness.verdict === "warming"
                ? "warm"
                : "cold";
          prospectUpdate.qualification_notes = merged.readiness.rationale;
          prospectUpdate.is_qualified = merged.readiness.verdict === "ready";
        }

        if (Object.keys(prospectUpdate).length) {
          await supabase
            .from("prospects")
            .update(prospectUpdate)
            .eq("id", prospectId);
        }
      } catch (dbErr) {
        console.error("Non-critical: win-here persistence failed:", dbErr);
      }
    }

    return NextResponse.json({
      content: finalContent,
      delta,
    });
  } catch (error) {
    console.error("win-here chat error:", error);
    return NextResponse.json(
      {
        content:
          "ok — something just glitched on my end. try that again?",
        delta: {},
        error: "Failed to process chat",
      },
      { status: 200 }
    );
  }
}
