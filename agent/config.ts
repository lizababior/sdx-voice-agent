// The agent, as code. Edit this once the build prompt drops, then run `npm run agent:setup`
// to push it to ElevenLabs. Every teammate shares the same agent (same ELEVENLABS_AGENT_ID).

export const AGENT_NAME = "SDx Voice Agent";

export const FIRST_MESSAGE = "Hey! I'm your voice agent. What should we build?";

export const SYSTEM_PROMPT = `You are a helpful, upbeat voice assistant.
Keep replies short and conversational: one or two sentences, no markdown, no lists.
When the user asks you to calculate, analyze data, or run code, write a small program and call the run_code tool,
then summarize the output out loud in plain words.`;

// Client tools run in the browser (src/components/VoiceAgent.tsx registers the handlers).
// The name and parameters here must match the handler there.
export const CLIENT_TOOLS = [
  {
    type: "client" as const,
    name: "run_code",
    description:
      "Run a short program in a secure Daytona cloud sandbox and return its stdout. Use print/console.log to produce output.",
    expectsResponse: true,
    responseTimeoutSecs: 60,
    parameters: {
      type: "object" as const,
      required: ["code", "language"],
      properties: {
        code: { type: "string" as const, description: "The full program source code" },
        language: {
          type: "string" as const,
          description: "python, typescript or javascript",
          enum: ["python", "typescript", "javascript"],
        },
      },
    },
  },
];
