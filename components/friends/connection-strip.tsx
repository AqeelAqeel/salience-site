"use client";

type Props = {
  friendName: string;
  googleEmail: string;
  threadCount: number;
  pendingCount: number;
  syncState: "idle" | "syncing" | "complete" | "error";
  syncProgress: { loaded: number; analyzed: number; total: number; error?: string };
  onResync: () => void;
};

export function ConnectionStrip({
  friendName,
  googleEmail,
  threadCount,
  pendingCount,
  syncState,
  syncProgress,
  onResync,
}: Props) {
  const first = friendName.split(" ")[0] || "";
  const statusLabel =
    syncState === "syncing"
      ? `reading · ${syncProgress.loaded}/${Math.max(syncProgress.total, syncProgress.loaded)}`
      : syncState === "error"
      ? `error · ${syncProgress.error ?? "unknown"}`
      : syncState === "complete"
      ? `${threadCount} threads · ${pendingCount} pending`
      : "idle";

  const dotClass =
    syncState === "syncing"
      ? "bg-[var(--fr-accent-soft)] shadow-[0_0_10px_rgba(251,191,36,0.7)] animate-pulse"
      : syncState === "error"
      ? "bg-[var(--fr-signal-red)]"
      : syncState === "complete"
      ? "bg-[var(--fr-signal-green)]"
      : "bg-[var(--fr-text-low)]";

  return (
    <div className="sticky top-0 z-20 backdrop-blur-sm bg-[rgba(10,10,11,0.72)] rule-bot">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-block w-2 h-2 rounded-full ${dotClass}`} />
          <p className="small-caps hidden md:block">
            {first ? `${first.toLowerCase()}'s cockpit` : "cockpit"}
          </p>
          <p className="mono text-[11px] text-[var(--fr-text-low)] truncate">
            {googleEmail}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="mono text-[11px] text-[var(--fr-text-mid)] whitespace-nowrap">
            {statusLabel}
          </p>
          <button
            type="button"
            onClick={onResync}
            disabled={syncState === "syncing"}
            className="fr-btn fr-btn-ghost text-[12px] py-1.5 px-3"
          >
            {syncState === "syncing" ? "syncing…" : "resync"}
          </button>
        </div>
      </div>
    </div>
  );
}
