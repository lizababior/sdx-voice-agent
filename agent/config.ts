// The agent definition. After you change this file, run `npm run agent:setup`.
// The command sends the prompt, the first message and the tools to your ElevenLabs agent.

export const AGENT_NAME = "SDx Voice Agent";

export const FIRST_MESSAGE = "Hey! I'm your voice agent. What should we build?";

export const SYSTEM_PROMPT = `You are a helpful, upbeat voice assistant.
Speak in one or two short, plain sentences, as in a phone call.
To calculate, analyze data or run code, write a short program and call the run_code tool.
Then tell the user the result in plain words.`;

// Tool definitions. Each tool needs a handler with the same name and parameters
// in src/components/VoiceAgent.tsx. The handler runs in the browser.
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
