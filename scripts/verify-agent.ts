// Reads the agent settings back from ElevenLabs. Run with: npm run agent:verify
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { CLIENT_TOOLS, EXTRA_LANGUAGES, KNOWLEDGE_BASE, LLM, VOICE_ID } from "../agent/config.ts";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const agentId = process.env.ELEVENLABS_AGENT_ID!;

let failed = false;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

const agent = await client.conversationalAi.agents.get(agentId);
const cc = agent.conversationConfig;
const prompt = cc.agent?.prompt;

check("LLM", prompt?.llm === LLM, String(prompt?.llm));
check("voice", cc.tts?.voiceId === VOICE_ID, String(cc.tts?.voiceId));
check("language detection on", Boolean(prompt?.builtInTools?.languageDetection));
const presets = Object.keys(cc.languagePresets ?? {});
check("language presets", EXTRA_LANGUAGES.every((l) => presets.includes(l)), presets.join(", "));

const { tools } = await client.conversationalAi.tools.list();
const attached = tools.filter((t) => prompt?.toolIds?.includes(t.id))
  .map((t) => ("name" in t.toolConfig ? t.toolConfig.name : "?")).sort();
const expected = CLIENT_TOOLS.map((t) => t.name).sort();
check("tools attached", attached.join(",") === expected.join(","), attached.join(", "));
check("run_code not attached", !attached.includes("run_code"));

const kb = (prompt?.knowledgeBase ?? []).map((d) => d.name.replace(/ \[.*\]$/, "")).sort();
check("knowledge base attached", kb.join(",") === KNOWLEDGE_BASE.map((d) => d.name).sort().join(","), kb.join(", "));

// Conversation behavior (greeting, tools, Spanish) is checked by `npm run agent:test`.
process.exit(failed ? 1 : 0);
