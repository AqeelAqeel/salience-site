import { getSupabase } from "@/lib/supabase";

// GET: Serve a shareable document by its share token
// Returns the HTML document directly (viewable in browser)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getSupabase();

    const { data: doc, error } = await supabase
      .from("prospect_documents")
      .select("*")
      .eq("share_token", token)
      .eq("is_shared", true)
      .single();

    if (error || !doc) {
      return new Response(
        `<html><body style="background:#0a0a0a;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1 style="color:#f59e0b">Document not found</h1></body></html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    return new Response(doc.content_html || doc.content_text, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Fetch shared document error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
