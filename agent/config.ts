// The VacMan agent definition. This file is the single source for every agent setting.
// After you change it, run `npm run agent:setup`. Do not change agent settings in the
// ElevenLabs dashboard: the next `agent:setup` overwrites them.
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import workOrder from "../data/work-order.json" with { type: "json" };

export const AGENT_NAME = "VacMan";

// Selected by ticket 05 (LLM test). Candidates: claude-haiku-5-5, gemini-3.5-flash.
export const LLM: ElevenLabs.Llm = "claude-haiku-5-5";

// One multilingual voice for English and Spanish.
export const VOICE_ID = "cjVigY5qzO86Huf0OWal";

export const LANGUAGE = "en";
export const EXTRA_LANGUAGES = ["es"];

// The work order fields that the phone page sends as dynamic variables at session start.
// The values here are placeholders for tests and the dashboard preview.
export const DYNAMIC_VARIABLES = {
  job_id: workOrder.job_id,
  customer_name: workOrder.customer_name,
  address: workOrder.address,
  equipment: workOrder.equipment,
  refrigerant: workOrder.refrigerant,
  metering_device: workOrder.metering_device,
  complaint: workOrder.complaint,
};

export const FIRST_MESSAGE =
  "Hey, it's VacMan, you're at {{customer_name}}'s with the {{equipment}}. What are you seeing?";

// Ticket 04 replaces this with the full behavior rules (build doc, section 7).
export const SYSTEM_PROMPT = `You are VacMan, the voice assistant of Coastal Comfort HVAC.
You help an HVAC technician on a job, hands-free.

Current job:
- Job: {{job_id}}
- Customer: {{customer_name}}, {{address}}
- Equipment: {{equipment}}, refrigerant {{refrigerant}}, {{metering_device}}
- Complaint: {{complaint}}

Speak in one or two short, plain sentences, as in a phone call.`;

// Client tools. The phone page runs a handler with the same name and parameters.
// Contract: section 5 of Docs/VacMan-Build-Plan-v2.md.
export const CLIENT_TOOLS: (ElevenLabs.ToolRequestModelToolConfig & { name: string })[] = [
  {
    type: "client" as const,
    name: "log_job_note",
    description:
      "Add or remove a job note. Add a note in English for each finding, measurement, repair or part. To correct a note, remove it by its note_id. Returns the note ID and the full list of notes.",
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
