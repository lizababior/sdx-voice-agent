# SDx Voice Agent

Starter for the SDxSDSU Voice Agent Hackathon (ElevenLabs + Daytona). The voice loop already works end to end, so we spend the afternoon on the idea.

**Schedule:** kickoff 12:00 (the prompt is revealed in the room) · demos from 4:30 · winners before 6.

## Before kickoff (everyone)

- [ ] Send your GitHub username so you can be added to this repo
- [ ] Redeem the ElevenLabs credits (instructions were sent to your RSVP email)
- [ ] Redeem the Daytona credits (same email)
- [ ] Clone the repo, run `npm install`, then do the setup below
- [ ] `npm run smoke` prints all `PASS`

## Setup

```bash
git clone <repo-url> && cd sdx-voice-agent
npm install
cp .env.example .env.local      # fill in keys (see below)
npm run agent:setup             # first run creates the agent and prints ELEVENLABS_AGENT_ID
npm run smoke                   # checks keys, token minting and a Daytona sandbox run
npm run dev                     # http://localhost:3000, click "Start talking"
```

**Keys:** everyone uses their **own** ElevenLabs and Daytona keys (from your redeemed credits). No keys are shared. `npm run agent:setup` creates your own copy of the agent from `agent/config.ts`, so all copies stay identical as long as changes go into that file (not the ElevenLabs dashboard). After pulling someone's change to `agent/config.ts`, run `npm run agent:setup` again.

Leave `DAYTONA_API_URL` out of `.env.local`: the SDK rejects it from a project `.env` file, and the default (`https://app.daytona.io/api`) is correct.

## How it works

```
Browser (src/components/VoiceAgent.tsx)
  ├─ GET  /api/conversation-token  → ElevenLabs WebRTC token (API key stays on the server)
  ├─ live voice session with the ElevenLabs agent (@elevenlabs/react)
  └─ agent calls client tool run_code → POST /api/run-code → Daytona ephemeral sandbox → stdout back to the agent
```

| File | What to change |
|---|---|
| `agent/config.ts` | System prompt, first message and tools. **Edit this first when the prompt drops**, then run `npm run agent:setup` |
| `src/components/VoiceAgent.tsx` | UI and client-tool handlers (`useConversationClientTool`) |
| `src/app/api/*` | Server routes. Add more tool backends here |
| `src/lib/daytona.ts` | Daytona sandbox helper |

### Adding a tool

1. Add it to `CLIENT_TOOLS` in `agent/config.ts` (name, description, parameters).
2. Register a handler with the same name in `VoiceAgent.tsx` using `useConversationClientTool("name", async (params) => ...)`.
3. Run `npm run agent:setup`.

Client tools run in the browser, so they work on localhost without a public URL.

## Demo tips

- The microphone needs `localhost` or HTTPS. To demo from another device, deploy: `npx vercel` and add the three env vars in the Vercel project.
- Test on the venue Wi-Fi early. Have a backup laptop with `.env.local` ready.
- Agent voice and LLM can be changed in the ElevenLabs dashboard (Agents → your agent). `agent:setup` only overwrites the prompt, first message and tools.
