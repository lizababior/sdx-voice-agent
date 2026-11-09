// Creates or updates the ElevenLabs agent from agent/config.ts.
// It sends the complete agent, so no dashboard setting survives. Run with: npm run agent:setup
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  AGENT_NAME, ASR_KEYWORDS, CLIENT_TOOLS, TTS_SPEED, DYNAMIC_VARIABLES, EXTRA_LANGUAGES, FIRST_MESSAGE,
  KNOWLEDGE_BASE, LANGUAGE, LLM, SYSTEM_PROMPT, VOICE_ID,
} from "../agent/config.ts";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const agentId = process.env.ELEVENLABS_AGENT_ID;

// The price book document is generated from the CSV, so prices have one source.
function priceBookMarkdown() {
  const [, ...rows] = readFileSync("data/price-book.csv", "utf8").trim().split("\n");
  const table = rows.map((r) => {
    const [code, name, price, unit] = r.split(",");
    return `| ${code} | ${name} | $${price} | ${unit} |`;
  });
  return [
    "# Coastal Comfort HVAC: flat-rate price book",
    "",
    "Each task or part has one fixed price. Prices are before sales tax (7.75%). Use the item code in job notes.",
    "",
    "| Item code | Name | Price | Unit |",
    "| --- | --- | --- | --- |",
    ...table,
  ].join("\n");
}

// Upload each knowledge base document under "<name> [<content hash>]".
// An unchanged document is reused. A changed document is uploaded again, and old versions are deleted.
const { documents } = await client.conversationalAi.knowledgeBase.list({ pageSize: 100, showOnlyOwnedDocuments: true });
const knowledgeBase = [];
const staleIds: string[] = [];
for (const doc of KNOWLEDGE_BASE) {
  const text = doc.name === "price-book" ? priceBookMarkdown() : readFileSync(`kb/${doc.name}.md`, "utf8");
  const versioned = `${doc.name} [${createHash("sha256").update(text).digest("hex").slice(0, 8)}]`;
  const same = documents.find((d) => d.name === versioned);
  const id = same?.id ?? (await client.conversationalAi.knowledgeBase.documents.createFromText({ text, name: versioned })).id;
  knowledgeBase.push({ type: "text" as const, name: versioned, id, usageMode: doc.usageMode });
  staleIds.push(...documents.filter((d) => d.name.startsWith(`${doc.name} [`) && d.name !== versioned).map((d) => d.id));
}

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
      knowledgeBase,
      builtInTools: {
        languageDetection: {
          name: "language_detection",
          params: { systemToolType: "language_detection" as const },
        },
      },
    },
  },
  asr: { keywords: ASR_KEYWORDS },
  // expressiveMode off: the agent writes plain text, with no audio tags such as [happy].
  tts: { voiceId: VOICE_ID, expressiveMode: false, speed: TTS_SPEED },
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

// Delete old versions of knowledge base documents, now that the agent no longer uses them.
for (const id of staleIds) {
  await client.conversationalAi.knowledgeBase.documents.delete(id).catch(() => {});
}
console.log(`Knowledge base: ${knowledgeBase.map((d) => d.name).join(", ")}`);
