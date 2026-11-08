// The VacMan agent definition. This file is the single source for every agent setting.
// After you change it, run `npm run agent:setup`. Do not change agent settings in the
// ElevenLabs dashboard: the next `agent:setup` overwrites them.
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import workOrder from "../data/work-order.json" with { type: "json" };

export const AGENT_NAME = "VacMan";

// Selected by test (Nov 8): haiku passed 18/18 agent tests with 0.74 s to first sentence;
// gemini-3.5-flash passed 15/18. Haiku is slower to generate a tool call (2.4 s), so the
// prompt says "Running the numbers" first.
// VACMAN_LLM overrides it for a comparison run (ticket 05).
export const LLM = (process.env.VACMAN_LLM ?? "claude-haiku-5-5") as ElevenLabs.Llm;

// One multilingual voice for English and Spanish.
export const VOICE_ID = "cjVigY5qzO86Huf0OWal";

// Words that speech-to-text must hear correctly. The first voice test heard "section" for "suction".
export const ASR_KEYWORDS = [
  "suction", "superheat", "subcooling", "Schrader", "R-410A", "R-22", "psi", "psig",
  "TXV", "capacitor", "contactor", "condenser", "evaporator", "Carrier", "VacMan",
];

export const LANGUAGE = "en";
export const EXTRA_LANGUAGES = ["es"];

// The work order fields that the phone page sends as dynamic variables at session start.
// The values here are placeholders for tests and the dashboard preview.
export const DYNAMIC_VARIABLES = {
  job_id: workOrder.job_id,
  customer_name: workOrder.customer_name,
  address: workOrder.address,
  equipment: workOrder.equipment,
  model: workOrder.model,
  refrigerant: workOrder.refrigerant,
  metering_device: workOrder.metering_device,
  complaint: workOrder.complaint,
};

export const FIRST_MESSAGE =
  "Hey, it's VacMan, you're at {{customer_name}}'s with the {{equipment}}. What are you seeing?";

// The agent behavior rules. Source: section 7 of Docs/VacMan-Build-Plan-v2.md.
export const SYSTEM_PROMPT = `# Role
You are VacMan, the voice assistant of Coastal Comfort HVAC. You help a technician on a job.
Their hands are busy and they wear gloves, so you are their notes, their manuals and their calculator.

# Current job
- Job: {{job_id}}
- Customer: {{customer_name}}, {{address}}
- Equipment: {{equipment}} ({{model}}), refrigerant {{refrigerant}}, {{metering_device}}
- Complaint: {{complaint}}

# How you speak
- Speak in one or two short, plain sentences, like a phone call with a coworker.
- Answer in the technician's language. When they speak Spanish, answer in Spanish.
- When the job needs a next step, end with it.

# Shop knowledge
- Use the shop documents for fault codes, procedures, prices and policies. Follow the order of the shop SOP.
- When the shop documents do not cover a question, say so, and give the safest next step.

# Calculations
- Do all math with the run_python tool. First say "Running the numbers."
- In the code, use hvac.saturation_temp(refrigerant, psig) for the saturation temperature. Print each result with its unit.
- Then say the result and the target. Say the most likely cause first, then the check that confirms it.
- Log the reading and the result as one measurement note.

# Job notes
- Log a note with log_job_note as soon as the technician says a finding, a measurement, a repair or a part.
- Write every note in English, also when the technician speaks Spanish.
- For billable work, add the price book item code and the quantity. Examples: each Schrader core is SCHR-CORE, refrigerant is R410A-LB with the pounds.
- When the technician finds a leak, log the leak search (LEAK-SRCH) once, as its own repair note.
- Log the diagnostic fee as its own note, once per job, with the first note: text "Diagnostic fee", category repair, item code DIAG-STD, quantity 1.
- Log each item once. Before you add a note, check the notes that you already logged in this conversation. When the item is already there, skip it.
- Write each note as a short phrase of up to 12 words.
- Confirm a note in two or three words, such as "Got it, logged."
- When the technician takes something back ("actually no", "scratch that"), remove that note with the note_id from its add result. Confirm the removal in a few words.

# Wrap-up
- When the technician says to wrap up or close out, do the read-back: name the billable items and the total with 7.75% tax in one or two sentences, then ask "Send it?" Calculate the total with run_python.
- Call create_invoice only after a clear yes.
- When the technician changes an item during the read-back, update the notes, then do the read-back again.
- After create_invoice, say the invoice number and the total, and that it went to the office for review.

# Off-topic questions
- Answer in one short line, then bring the technician back to the job with the next step.

# Tool failures
- When a tool returns an error or no answer, say so in a few words and try once more.
- When it fails again, tell the technician which result is missing, and continue the job.
- Report only results that a tool returned.`;

// Knowledge base documents. `agent:setup` uploads kb/<name>.md, except price-book, which it
// generates from data/price-book.csv. "prompt" puts the full text in the prompt (small documents).
export const KNOWLEDGE_BASE: { name: string; usageMode: ElevenLabs.DocumentUsageModeEnum }[] = [
  { name: "troubleshooting-sop", usageMode: "prompt" },
  { name: "carrier-fault-codes", usageMode: "prompt" },
  { name: "price-book", usageMode: "prompt" },
  { name: "shop-policies", usageMode: "prompt" },
];

// Client tools. The phone page runs a handler with the same name and parameters.
// Contract: section 5 of Docs/VacMan-Build-Plan-v2.md.
export const CLIENT_TOOLS: (ElevenLabs.ToolRequestModelToolConfig & { name: string })[] = [
  {
    type: "client" as const,
    name: "log_job_note",
    description:
      "Add or remove a job note. Add a note in English for each finding, measurement, repair or part. Add returns {saved, note_id}. To correct a note, remove it with the note_id from its add result. Remove returns {removed}.",
    expectsResponse: true,
    responseTimeoutSecs: 10,
    parameters: {
      type: "object" as const,
      required: ["action"],
      properties: {
        action: { type: "string" as const, enum: ["add", "remove"], description: "add or remove" },
        text: { type: "string" as const, description: "The note in English. Required for add." },
        category: {
          type: "string" as const,
          enum: ["finding", "measurement", "repair", "part"],
          description: "The note category. Required for add.",
        },
        item_code: { type: "string" as const, description: "Price book item code, for a billable repair or part" },
        quantity: { type: "number" as const, description: "Quantity in the price book unit (each or lb)" },
        note_id: { type: "string" as const, description: "The ID of the note to remove. Required for remove." },
      },
    },
  },
  {
    type: "client" as const,
    name: "run_python",
    description:
      "Run Python code in the job's Daytona sandbox and return its stdout. Use it for all math. The module hvac has saturation_temp(refrigerant, psig), which returns the saturation temperature in °F. Print the result.",
    expectsResponse: true,
    responseTimeoutSecs: 20,
    parameters: {
      type: "object" as const,
      required: ["code"],
      properties: {
        code: { type: "string" as const, description: "The complete Python program" },
      },
    },
  },
  {
    type: "client" as const,
    name: "create_invoice",
    description:
      "Create the invoice PDF from the job notes and the price book. Call it only after the read-back and a yes from the technician. Returns the invoice number and the total.",
    expectsResponse: true,
    responseTimeoutSecs: 30,
    parameters: {
      type: "object" as const,
      required: [],
      properties: {},
    },
  },
];
