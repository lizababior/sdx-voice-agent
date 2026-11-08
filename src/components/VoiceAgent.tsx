"use client";

import { useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { MicDock, type MicState } from "./MicDock";

/** Wrap the session screen with this. The mic dock inside it talks to the ElevenLabs agent. */
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}

export function VoiceDock({
  dynamicVariables,
  note,
}: {
  dynamicVariables: Record<string, string>;
  note?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);

  const { status, mode, startSession, endSession, sendUserMessage } = useConversation({
    onError: (message: string) => setError(message),
    onDisconnect: () => setError(null),
  });

  const connected = status === "connected";
  const connecting = status === "connecting";

  async function start() {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Mic is blocked. Tap here to fix");
      return;
    }
    try {
      const res = await fetch("/api/conversation-token");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the session.");
      startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        useWakeLock: true,
        dynamicVariables,
      });
      navigator.vibrate?.(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lost connection. Tap the mic to reconnect.");
    }
  }

  function toggle() {
    if (connected || connecting) {
      endSession();
      navigator.vibrate?.(10);
    } else {
      void start();
    }
  }

  const micState: MicState = error
    ? "error"
    : connecting
      ? "connecting"
      : connected
        ? mode === "speaking"
          ? "speaking"
          : "listening"
        : "idle";

  return (
    <MicDock
      state={micState}
      errorText={error}
      note={connected ? note : null}
      onToggle={toggle}
      onCloseOut={() => sendUserMessage("Close it out")}
      closeOutDisabled={!connected}
    />
  );
}
