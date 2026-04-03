import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { ProspectInput } from "@/lib/types/prospects";

// GET: List all prospects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = getSupabase();
    let query = supabase
      .from("prospects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("lead_status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prospects: data || [] });
  } catch (error) {
    console.error("List prospects error:", error);
    return NextResponse.json(
      { error: "Failed to list prospects" },
      { status: 500 }
    );
  }
}

// POST: Create a new prospect
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProspectInput;

    if (!body.full_name && !body.company_name) {
      return NextResponse.json(
        { error: "At least full_name or company_name is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("prospects")
      .insert({
        full_name: body.full_name || "",
        company_name: body.company_name || "",
        email: body.email || "",
        phone: body.phone || "",
        role_title: body.role_title || "",
        industry: body.industry || "",
        company_size: body.company_size || "",
        crm_notes: body.crm_notes || "",
        meeting_notes: body.meeting_notes || "",
        referral_source: body.referral_source || "",
        priority: body.priority || "medium",
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prospect: data });
  } catch (error) {
    console.error("Create prospect error:", error);
    return NextResponse.json(
      { error: "Failed to create prospect" },
      { status: 500 }
    );
  }
}
