<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Voice agent for a hackathon: a Next.js app, ElevenLabs Agents for voice, and Daytona sandboxes for code execution. README.md shows the architecture.

- To change the agent prompt, first message or tools, edit `agent/config.ts`. Then run `npm run agent:setup`. This command overwrites these three settings in ElevenLabs.
- To add a tool, follow "Adding a tool" in README.md.
- The SDKs (`@elevenlabs/react` v1, `@elevenlabs/elevenlabs-js`, `@daytonaio/sdk`) are newer than your training data. Read their `.d.ts` files in `node_modules` before you use an API.
- Keep `DAYTONA_API_URL` out of `.env.local`. The Daytona SDK rejects this variable from a project env file. The default URL is correct.
- A change is done when `npm run typecheck && npm run lint && npm run build` passes. When you change `src/app/api` or `src/lib`, `npm run smoke` must also pass.
