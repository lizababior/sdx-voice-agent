"use client";

import { useConversationClientTool } from "@elevenlabs/react";
import type { JobSessionTools } from "@/lib/useJobSession";

/**
 * Registers the agent's 3 client tools with the conversation. Render it inside the VoiceProvider.
 * The names and parameters must agree with CLIENT_TOOLS in agent/config.ts.
 */
export function JobTools({ tools }: { tools: JobSessionTools }) {
  useConversationClientTool("log_job_note", (params: Record<string, unknown>) => tools.logJobNote(params));
  useConversationClientTool("run_python", (params: Record<string, unknown>) =>
    tools.runPython({ code: typeof params.code === "string" ? params.code : undefined }),
  );
  useConversationClientTool("create_invoice", () => tools.createInvoice());
  return null;
}
