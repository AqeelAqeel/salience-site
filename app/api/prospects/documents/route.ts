import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";
import type { IntakeTurn, ProspectSummary } from "@/lib/types/prospects";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST: Generate a shareable document from a session
export async function POST(request: Request) {
  try {
    const { prospectId, sessionId, docType } = await request.json();

    if (!prospectId || !sessionId) {
      return NextResponse.json(
        { error: "prospectId and sessionId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Fetch prospect info
    const { data: prospect } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .single();

    // Fetch session turns
    const { data: turns } = await supabase
      .from("prospect_turns")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!turns || turns.length === 0) {
      return NextResponse.json(
        { error: "No conversation data found" },
        { status: 404 }
      );
    }

    const transcript = (turns as IntakeTurn[])
      .map(
        (t) =>
          `${t.role === "user" ? (prospect?.full_name || "Prospect") : "Salience"}: ${t.content}`
      )
      .join("\n\n");

    const openai = getOpenAI();

    // Generate structured summary + readable document
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are generating a professional consultation summary document for a prospect who just had an AI discovery call with Salience.

Generate a JSON response with this exact shape:
{
  "title": "AI Consultation Summary — [Company/Person Name]",
  "summary": {
    "wantsAiFor": ["..."],
    "manualProcesses": ["..."],
    "vaWorthyTasks": ["..."],
    "businessContext": "...",
    "keyInsights": ["..."]
  },
  "documentHtml": "<full HTML document string>",
  "documentText": "plain text version"
}

The documentHtml should be a complete, styled HTML document (inline CSS) that looks professional when opened in a browser. Use a clean, modern design with:
- Dark background (#0a0a0a) with white/gray text
- Amber (#f59e0b) accent color for headings and highlights
- Sections for: Executive Summary, Business Context, AI Opportunities, Manual Processes, Recommended Next Steps
- A "Prepared by Salience" footer
- Professional typography

The documentText should be the same content in plain text format.

Return ONLY valid JSON, no markdown wrapping.`,
        },
        {
          role: "user",
          content: `Prospect: ${prospect?.full_name || "Unknown"}\nCompany: ${prospect?.company_name || "Unknown"}\nIndustry: ${prospect?.industry || "Unknown"}\n\nTranscript:\n${transcript}`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content || "{}";

    let parsed: {
      title: string;
      summary: ProspectSummary;
      documentHtml: string;
      documentText: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        title: "Consultation Summary",
        summary: {
          wantsAiFor: [],
          manualProcesses: [],
          vaWorthyTasks: [],
          businessContext: "",
          keyInsights: [],
        },
        documentHtml: `<html><body><pre>${raw}</pre></body></html>`,
        documentText: raw,
      };
    }

    // Save document to DB
    const { data: doc, error } = await supabase
      .from("prospect_documents")
      .insert({
        prospect_id: prospectId,
        session_id: sessionId,
        doc_type: docType || "summary",
        title: parsed.title,
        content_html: parsed.documentHtml,
        content_text: parsed.documentText,
        content_json: parsed.summary,
        is_shared: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Save document error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update session with summary
    await supabase
      .from("prospect_sessions")
      .update({
        summary_json: parsed.summary,
        summary_text: parsed.documentText,
        status: "completed",
        turn_count: turns.length,
      })
      .eq("id", sessionId);

    // Update prospect with extracted data
    if (parsed.summary) {
      await supabase
        .from("prospects")
        .update({
          ai_aspirations: parsed.summary.wantsAiFor || [],
          manual_processes: parsed.summary.manualProcesses || [],
          va_worthy_tasks: parsed.summary.vaWorthyTasks || [],
        })
        .eq("id", prospectId);
    }

    return NextResponse.json({
      document: doc,
      summary: parsed.summary,
      shareUrl: `/api/prospects/documents/${doc.share_token}`,
    });
  } catch (error) {
    console.error("Generate document error:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
