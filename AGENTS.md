<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Hackathon voice agent: Next.js app + ElevenLabs Agents (voice) + Daytona (sandboxed code execution). See README.md for architecture.

- Agent prompt and tools are code in `agent/config.ts`; push changes with `npm run agent:setup`.
- A client tool needs both an entry in `CLIENT_TOOLS` and a matching `useConversationClientTool` handler in `src/components/VoiceAgent.tsx`.
- SDK APIs (`@elevenlabs/react` v1, `@elevenlabs/elevenlabs-js`, `@daytonaio/sdk`) are newer than most training data. Check the `.d.ts` files in `node_modules` before using an API you are not sure about.
- Verify with `npm run typecheck && npm run lint && npm run build`, and `npm run smoke` for live keys.
- Never commit `.env.local`.
