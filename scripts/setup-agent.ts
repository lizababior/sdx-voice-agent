// Creates or updates the ElevenLabs agent from agent/config.ts.
// It sends the complete agent, so no dashboard setting survives. Run with: npm run agent:setup
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  AGENT_NAME, CLIENT_TOOLS, DYNAMIC_VARIABLES, EXTRA_LANGUAGES, FIRST_MESSAGE,
  LANGUAGE, LLM, SYSTEM_PROMPT, VOICE_ID,
} from "../agent/config.ts";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const agentId = process.env.ELEVENLABS_AGENT_ID;

// Find each tool by name and update it. This prevents duplicate tools when you run the script again.
const { tools: existing } = await client.conversationalAi.tools.list();
const toolIds: string[] = [];
for (const toolConfig of CLIENT_TOOLS) {
  const match = existing.find((t) => "name" in t.toolConfig && t.toolConfig.name === toolConfig.name);
  if (match) {
    await client.conversationalAi.tools.update(match.id, { toolConfig });
    toolIds.push(match.id);
  } else {
    const created = await client.conversationalAi.tools.create({ toolConfig });
    toolIds.push(created.id);
  }
}

const conversationConfig = {
  agent: {
    firstMessage: FIRST_MESSAGE,
    language: LANGUAGE,
    dynamicVariables: { dynamicVariablePlaceholders: DYNAMIC_VARIABLES },
    prompt: {
      prompt: SYSTEM_PROMPT,
      llm: LLM,
      toolIds,
      builtInTools: {
        languageDetection: {
          name: "language_detection",
          params: { systemToolType: "language_detection" as const },
        },
      },
    },
  },
  tts: { voiceId: VOICE_ID },
  languagePresets: Object.fromEntries(
    EXTRA_LANGUAGES.map((language) => [language, { overrides: { agent: { language } } }]),
  ),
};

if (agentId) {
  await client.conversationalAi.agents.update(agentId, { name: AGENT_NAME, conversationConfig });
  console.log(`Updated agent ${agentId} (tools: ${CLIENT_TOOLS.map((t) => t.name).join(", ")})`);
} else {
  const { agentId: newId } = await client.conversationalAi.agents.create({
    name: AGENT_NAME,
    conversationConfig,
  });
  console.log(`Created agent. Add this to your .env.local:\n\nELEVENLABS_AGENT_ID=${newId}\n`);
}
