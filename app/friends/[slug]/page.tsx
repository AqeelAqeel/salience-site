import { notFound } from "next/navigation";
import { getCockpitSnapshot, getFriendBySlug } from "@/lib/friends/db";
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

  const snapshot = await getCockpitSnapshot(friend);

  return (
    <Cockpit
      slug={slug}
      initialSnapshot={snapshot}
      supabase={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      }}
    />
  );
}
