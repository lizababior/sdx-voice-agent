/**
 * The phone page sends console events over BroadcastChannel("vacman").
 * Both pages must be open in the same browser on the same laptop (v2, section 5).
 * The phone keeps a history and replays it when the console opens late.
 */
type Base = { time: number };
export type BusEvent =
  | (Base & { event: "transcript"; role: "user" | "agent"; text: string; language: "en" | "es" })
  | (Base & { event: "tool_start"; callId: number; name: string; args: unknown })
  | (Base & { event: "tool_end"; callId: number; name: string; result: string; ms: number; ok: boolean })
  | (Base & { event: "sandbox"; id?: string; status: "warming" | "warm" | "failed" })
  | (Base & { event: "latency"; ms: number });

type Payload<T> = T extends unknown ? Omit<T, "time"> : never;
export type BusInput = Payload<BusEvent>;

const NAME = "vacman";
const history: BusEvent[] = [];
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  channel ??= new BroadcastChannel(NAME);
  return channel;
}

/** Phone side. Send one event and keep it for a console that opens later. */
export function emit(input: BusInput) {
  const event = { ...input, time: Date.now() } as BusEvent;
  history.push(event);
  getChannel()?.postMessage(event);
}

/** Phone side. Replays the history when a console says hello. Returns a cleanup function. */
export function hostBus(): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const onMessage = (e: MessageEvent) => {
    if (e.data === "hello") for (const ev of history) ch.postMessage(ev);
  };
  ch.addEventListener("message", onMessage);
  return () => ch.removeEventListener("message", onMessage);
}

/** Console side. Calls `onEvent` for each event, including the replayed history. */
export function listenBus(onEvent: (e: BusEvent) => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  // A separate channel object: a channel does not receive its own messages.
  const ch = new BroadcastChannel(NAME);
  ch.onmessage = (e) => {
    if (e.data !== "hello") onEvent(e.data as BusEvent);
  };
  ch.postMessage("hello");
  return () => ch.close();
}
