import { notFound } from "next/navigation";
import { getFriendBySlug } from "@/lib/friends/db";
import { Cockpit } from "@/components/friends/cockpit";

export const dynamic = "force-dynamic";

export default async function FriendsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const friend = await getFriendBySlug(slug);
  if (!friend) notFound();

  // Intentionally do NOT load the cockpit snapshot here — that's the data
  // tenancy boundary. The friend record itself only carries operator-authored
  // marketing copy (headline, pitch, tone hints) which is safe to render
  // pre-auth. The Cockpit component fetches the real snapshot from
  // /api/friends/{slug}/snapshot after Supabase auth confirms ownership.
  return (
    <Cockpit
      slug={slug}
      friend={friend}
      supabase={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      }}
    />
  );
}
