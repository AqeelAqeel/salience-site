#!/usr/bin/env node
/**
 * Seed a test friend at /friends/test-slug so the UI can be exercised
 * without creating a real prospect row.
 *
 * Run: node scripts/friends/seed-test-slug.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or service role key in .env.local");
  process.exit(1);
}

const supa = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const row = {
  full_name: "Test Friend",
  company_name: "Example Co",
  role_title: "Founder",
  email: "test@example.com",
  friend_slug: "test-slug",
  friend_enabled: true,
  friend_headline: "Hey Test — I built you a *thing*.",
  friend_pitch:
    "A small, private cockpit that reads your recent email, tells you what actually matters, and drafts replies in your voice. Sign in with Google — read-only. Your mail stays in your account.",
  friend_tone_hints:
    "Write concisely. Drop the pleasantries. Match the sender's register. Use em-dashes, avoid exclamation points. Sign off with '— A'.",
  friend_signoff: "— A",
  crm_notes: "Seed row for local testing of /friends/test-slug",
  priority: "high",
  lead_status: "warm",
};

const { data, error } = await supa
  .from("prospects")
  .upsert(row, { onConflict: "friend_slug" })
  .select()
  .single();

if (error) {
  console.error("seed failed:", error);
  process.exit(1);
}

console.log("seeded:", {
  id: data.id,
  friend_slug: data.friend_slug,
  friend_enabled: data.friend_enabled,
});
console.log("→ open http://localhost:3001/friends/test-slug");
