// Checks that every key works before kickoff. Run with: npm run smoke
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { runCode } from "../src/lib/daytona.ts";

let failed = false;
async function check(name: string, fn: () => Promise<string>) {
  try {
    console.log(`PASS  ${name}  ${await fn()}`);
  } catch (err) {
    failed = true;
    console.log(`FAIL  ${name}  ${err instanceof Error ? err.message : err}`);
  }
}

for (const key of ["ELEVENLABS_API_KEY", "ELEVENLABS_AGENT_ID", "DAYTONA_API_KEY"]) {
  await check(`env ${key}`, async () => {
    if (!process.env[key]) throw new Error("missing in .env.local");
    return "set";
  });
}

await check("elevenlabs conversation token", async () => {
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  const { token } = await client.conversationalAi.conversations.getWebrtcToken({
    agentId: process.env.ELEVENLABS_AGENT_ID!,
  });
  return `token ${token.slice(0, 8)}…`;
});

await check("daytona sandbox run", async () => {
  const { exitCode, output } = await runCode("print(6 * 7)");
  if (exitCode !== 0 || !output.includes("42")) throw new Error(`exit ${exitCode}: ${output}`);
  return "printed 42";
});

process.exit(failed ? 1 : 0);
