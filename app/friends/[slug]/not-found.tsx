export default function FriendNotFound() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <p className="small-caps mb-6">not found</p>
      <h1 className="display text-4xl md:text-5xl mb-3">
        This door wasn&rsquo;t for you.
      </h1>
      <p className="text-[var(--fr-text-mid)] max-w-md">
        The cockpit at this URL isn&rsquo;t active. If someone promised you one,
        ask them to double-check the link.
      </p>
    </main>
  );
}
