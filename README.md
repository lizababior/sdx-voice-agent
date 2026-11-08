# SDx Voice Agent

Starter for the SDxSDSU Voice Agent Hackathon (ElevenLabs + Daytona). The voice loop works from end to end. Use the build time for the idea.

## Setup

1. Clone the repo and install the packages:
   ```bash
   git clone https://github.com/lizababior/sdx-voice-agent.git
   cd sdx-voice-agent
   npm install
   ```
2. Copy the env file: `cp .env.example .env.local`.
3. Put your ElevenLabs API key and your Daytona API key in `.env.local`. Use your own keys. They come from your redeemed credits.
4. Run `npm run agent:setup`. The command creates your agent and shows its ID.
5. Put the ID in `.env.local` as `ELEVENLABS_AGENT_ID`.
6. Run `npm run smoke`. All lines must show `PASS`.
7. Run `npm run dev`. Open http://localhost:3000 and click **Start talking**.

## The agent

Each team member has a copy of the agent in their own ElevenLabs account. `agent/config.ts` is the single source of truth for all copies. It holds the prompt, the first message and the tools.

To change the agent:

1. Edit `agent/config.ts`.
2. Run `npm run agent:setup`.
3. Push the change. Each team member pulls it and runs `npm run agent:setup`.

`npm run agent:setup` overwrites the prompt, the first message and the tools in ElevenLabs. Other settings, such as the voice and the LLM, stay as they are. You change those settings in the ElevenLabs dashboard, and each team member must change them in their own account.

## How it works

```
Browser (src/components/VoiceAgent.tsx)
  ├─ GET  /api/conversation-token  → ElevenLabs WebRTC token (the API key stays on the server)
  ├─ POST /api/sandbox/start       → warm Daytona sandbox for the job
  ├─ live voice session with the ElevenLabs agent (@elevenlabs/react)
  └─ the agent calls client tools in the browser:
       log_job_note   → notes in the page state
       run_python     → POST /api/sandbox/run     → Daytona sandbox → stdout back to the agent
       create_invoice → POST /api/sandbox/invoice → invoice PDF
```

The home page is `/`, the job session is `/job` and the console is `/console`. Open both in the same browser. See `Docs/VacMan-Build-Plan-v2.md`.

| File | Contents |
|---|---|
| `agent/config.ts` | Agent prompt, first message and tools |
| `src/components/VoiceAgent.tsx` | UI and tool handlers |
| `src/components/Console.tsx` | The console page |
| `src/app/api/*` | Server routes for tools |
| `src/lib/sandbox.ts` | The job sandbox: start, run Python, build the invoice |
| `src/lib/daytona.ts` | Runs code in a Daytona sandbox (smoke test) |

### Adding a tool

A tool has two parts with the same name: a definition and a handler.

1. Add the definition to `CLIENT_TOOLS` in `agent/config.ts`. Give the name, the description and the parameters.
2. Add the handler in `src/components/VoiceAgent.tsx` with `useConversationClientTool("<name>", async (params) => ...)`.
3. Run `npm run agent:setup`.

The handler runs in the browser. Thus the tool works on localhost and needs no public URL.

## Demo tips

- The microphone works only on `localhost` or HTTPS. Do the demo on `localhost` if possible.
- Do not deploy this app. `/api/sandbox/run` runs code on your Daytona credits, and anyone with a public URL could call it.
- Test on the venue Wi-Fi early. Prepare a second laptop with a working `.env.local`.
