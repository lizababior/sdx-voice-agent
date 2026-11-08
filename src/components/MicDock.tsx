export type MicState = "idle" | "connecting" | "listening" | "speaking" | "error";

const CAPTION: Record<MicState, string> = {
  idle: "Tap to talk to VacMan",
  connecting: "Connecting…",
  listening: "Listening…",
  speaking: "VacMan is talking",
  error: "",
};

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function Bars() {
  return (
    <span className="flex h-10 items-center gap-1.5" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-full w-2 origin-center animate-bar rounded-full bg-white"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export function MicDock({
  state,
  errorText,
  note,
  onToggle,
  onCloseOut,
  closeOutDisabled,
}: {
  state: MicState;
  errorText?: string | null;
  /** Extra line under the caption, for example "Building invoice…". */
  note?: string | null;
  onToggle: () => void;
  onCloseOut: () => void;
  closeOutDisabled: boolean;
}) {
  const on = state === "listening" || state === "speaking" || state === "connecting";
  const isError = state === "error";
  return (
    <div className="pb-safe flex flex-col items-center gap-3 border-t border-line bg-bg px-4 pt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        aria-label={on ? "End session" : "Start talking to VacMan"}
        className={`relative flex size-28 items-center justify-center rounded-full active:scale-95 ${
          isError ? "bg-surface-2 text-text-dim" : "bg-accent text-accent-ink"
        }`}
      >
        {state === "listening" && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-4 border-accent" />
        )}
        {state === "connecting" && (
          <span className="absolute -inset-1 animate-spin-ring rounded-full border-4 border-transparent border-t-accent" />
        )}
        {state === "speaking" ? <Bars /> : <MicIcon />}
      </button>

      <p aria-live="polite" className={`min-h-7 text-center ${isError ? "text-danger" : "text-text-dim"}`}>
        {isError ? (errorText ?? "Mic is blocked. Tap here to fix") : (note ?? CAPTION[state])}
      </p>

      <button
        type="button"
        onClick={onCloseOut}
        disabled={closeOutDisabled}
        className="h-14 w-full rounded-button border border-line text-lg font-semibold active:bg-surface-2 disabled:text-text-dim disabled:opacity-60"
      >
        Close out job
      </button>
    </div>
  );
}
