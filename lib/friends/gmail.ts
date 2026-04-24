import { google, gmail_v1 } from "googleapis";
import { getServerSupabase } from "../supabase-server";
import type { FriendGmailToken } from "./types";

type NormalizedMessage = {
  gmailMessageId: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  ccEmails: string[];
  sentAt: Date | null;
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
};

type NormalizedThread = {
  gmailThreadId: string;
  subject: string;
  participants: string[];
  lastMessageAt: Date | null;
  snippet: string;
  messages: NormalizedMessage[];
};

const TOKEN_REFRESH_SKEW_MS = 60_000;

async function refreshIfNeeded(token: FriendGmailToken): Promise<FriendGmailToken> {
  const expiry = token.expiry_date ? new Date(token.expiry_date).getTime() : 0;
  if (expiry && expiry - TOKEN_REFRESH_SKEW_MS > Date.now()) return token;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Gmail token expired and GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET aren't set. Add them so we can refresh."
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };

  const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const supa = getServerSupabase();
  const { data: updated, error } = await supa
    .from("friend_gmail_tokens")
    .update({
      access_token: data.access_token,
      expiry_date: newExpiry,
      scope: data.scope ?? token.scope,
    })
    .eq("id", token.id)
    .select()
    .single();

  if (error) throw new Error(`failed to persist refreshed token: ${error.message}`);
  return updated as FriendGmailToken;
}

function gmailClient(token: FriendGmailToken): gmail_v1.Gmail {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token.access_token });
  return google.gmail({ version: "v1", auth });
}

function decodeBody(data?: string | null): string {
  if (!data) return "";
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(normalized, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractBody(payload?: gmail_v1.Schema$MessagePart | null): {
  text: string;
  html: string;
} {
  if (!payload) return { text: "", html: "" };
  let text = "";
  let html = "";

  const walk = (part: gmail_v1.Schema$MessagePart) => {
    if (part.mimeType === "text/plain" && !text) {
      text = decodeBody(part.body?.data);
    } else if (part.mimeType === "text/html" && !html) {
      html = decodeBody(part.body?.data);
    }
    for (const sub of part.parts ?? []) walk(sub);
  };
  walk(payload);

  if (!text && html) {
    text = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return { text, html };
}

function parseAddress(header: string): { email: string; name: string } {
  const match = header.match(/(?:"?([^"<]*)"?\s*)?<([^>]+)>/);
  if (match) {
    return { name: (match[1] || "").trim(), email: match[2].trim() };
  }
  return { name: "", email: header.trim() };
}

function splitAddresses(header: string): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((p) => parseAddress(p).email)
    .filter(Boolean);
}

function headerValue(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  const h = headers?.find(
    (x) => x.name?.toLowerCase() === name.toLowerCase()
  );
  return h?.value ?? "";
}

function normalizeMessage(
  msg: gmail_v1.Schema$Message
): NormalizedMessage | null {
  if (!msg.id || !msg.threadId) return null;
  const headers = msg.payload?.headers;
  const fromHeader = headerValue(headers, "From");
  const from = parseAddress(fromHeader);
  const { text, html } = extractBody(msg.payload);
  const dateMs = msg.internalDate ? Number(msg.internalDate) : NaN;
  return {
    gmailMessageId: msg.id,
    threadId: msg.threadId,
    fromEmail: from.email,
    fromName: from.name,
    toEmails: splitAddresses(headerValue(headers, "To")),
    ccEmails: splitAddresses(headerValue(headers, "Cc")),
    sentAt: Number.isFinite(dateMs) ? new Date(dateMs) : null,
    subject: headerValue(headers, "Subject"),
    snippet: msg.snippet ?? "",
    bodyText: text,
    bodyHtml: html,
  };
}

export async function fetchRecentThreads(
  token: FriendGmailToken,
  opts: { maxThreads?: number; query?: string } = {}
): Promise<NormalizedThread[]> {
  const fresh = await refreshIfNeeded(token);
  const gmail = gmailClient(fresh);
  const max = opts.maxThreads ?? 50;

  const list = await gmail.users.threads.list({
    userId: "me",
    maxResults: max,
    q: opts.query ?? "in:inbox -category:promotions -category:social",
  });

  const threadIds = (list.data.threads ?? [])
    .map((t) => t.id)
    .filter((x): x is string => Boolean(x));

  const threads: NormalizedThread[] = [];
  for (const id of threadIds) {
    try {
      const detail = await gmail.users.threads.get({
        userId: "me",
        id,
        format: "full",
      });
      const msgs = (detail.data.messages ?? [])
        .map(normalizeMessage)
        .filter((m): m is NormalizedMessage => m !== null);
      if (!msgs.length) continue;

      const subject = msgs[0]?.subject ?? "";
      const participants = Array.from(
        new Set(
          msgs.flatMap((m) =>
            [m.fromEmail, ...m.toEmails, ...m.ccEmails].filter(Boolean)
          )
        )
      );
      const last = msgs.reduce<Date | null>((acc, m) => {
        if (!m.sentAt) return acc;
        return !acc || m.sentAt > acc ? m.sentAt : acc;
      }, null);

      threads.push({
        gmailThreadId: id,
        subject,
        participants,
        lastMessageAt: last,
        snippet: detail.data.snippet ?? msgs[msgs.length - 1]?.snippet ?? "",
        messages: msgs,
      });
    } catch (err) {
      console.warn(`[gmail] failed to load thread ${id}`, err);
    }
  }
  return threads;
}

export async function fetchSentBodies(
  token: FriendGmailToken,
  opts: { maxMessages?: number } = {}
): Promise<string[]> {
  const fresh = await refreshIfNeeded(token);
  const gmail = gmailClient(fresh);
  const max = opts.maxMessages ?? 20;

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
    q: "in:sent",
  });

  const ids = (list.data.messages ?? [])
    .map((m) => m.id)
    .filter((x): x is string => Boolean(x));

  const bodies: string[] = [];
  for (const id of ids) {
    try {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });
      const { text } = extractBody(detail.data.payload);
      if (text) bodies.push(text.slice(0, 4000));
    } catch (err) {
      console.warn(`[gmail] failed to load sent message ${id}`, err);
    }
  }
  return bodies;
}

export async function createGmailDraft(
  token: FriendGmailToken,
  args: {
    threadId: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    inReplyToMessageId?: string;
  }
): Promise<string> {
  const fresh = await refreshIfNeeded(token);
  const gmail = gmailClient(fresh);

  const lines: string[] = [];
  if (args.to.length) lines.push(`To: ${args.to.join(", ")}`);
  if (args.cc?.length) lines.push(`Cc: ${args.cc.join(", ")}`);
  lines.push(`Subject: ${args.subject}`);
  if (args.inReplyToMessageId) {
    lines.push(`In-Reply-To: ${args.inReplyToMessageId}`);
    lines.push(`References: ${args.inReplyToMessageId}`);
  }
  lines.push("Content-Type: text/plain; charset=UTF-8");
  lines.push("");
  lines.push(args.body);

  const raw = Buffer.from(lines.join("\r\n"), "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { threadId: args.threadId, raw } },
  });
  return res.data.id ?? "";
}

export type { NormalizedThread, NormalizedMessage };
