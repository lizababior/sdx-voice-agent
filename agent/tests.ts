// Agent simulation tests. An LLM judge scores each success condition.
// Run with: npm run agent:test  (options: --only <name>  --k <trials>)
import { DYNAMIC_VARIABLES } from "./config.ts";

export type ToolMock = { when?: Record<string, string>; result: string };

export type AgentTest = {
  name: string;
  // What the simulated technician says and does.
  scenario: string;
  // The judge passes the test when all of these are true.
  successConditions: string[];
  maxTurns: number;
  // Mocked tool results by tool name. Tools without a mock return a generic success.
  // A list gives conditional mocks: the first one whose `when` parameters match exactly is used.
  toolMocks?: Record<string, string | ToolMock[]>;
};

// Mocked log_job_note results, by item code. Add returns {saved, note_id}. Remove returns {removed}.
const saved = (note_id: string) => JSON.stringify({ saved: true, note_id });
const NOTE_MOCKS: ToolMock[] = [
  { when: { action: "remove" }, result: JSON.stringify({ removed: true }) },
  { when: { item_code: "DIAG-STD" }, result: saved("n1") },
  { when: { item_code: "LEAK-SRCH" }, result: saved("n2") },
  { when: { item_code: "SCHR-CORE" }, result: saved("n3") },
  { when: { item_code: "R410A-LB" }, result: saved("n4") },
  { when: { item_code: "CAP-DUAL" }, result: saved("n5") },
  { result: saved("n6") },
];

export const TESTS: AgentTest[] = [
  {
    name: "vacman-greeting",
    scenario:
      "You are Maria, an HVAC technician who just arrived at the job. When the agent greets you, reply only: 'Hi, ready.'",
    successConditions: [
      "The agent's first message names the customer Linda Johnson.",
      "The agent's first message names the equipment, a Carrier 3-ton condenser.",
      "The agent's first message is one or two short sentences.",
    ],
    maxTurns: 2,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
  {
    name: "vacman-kb-fault-code",
    scenario:
      "You are Maria, an HVAC technician at the job. After the greeting, say: 'The outdoor board is flashing three short, two long. What does that mean?' Then say thanks and stop.",
    successConditions: [
      "The agent identifies the code as 32, a low-pressure switch trip (low pressure switch open).",
      "The agent tells the technician to check the indoor airflow, and names the refrigerant charge as a check (now or as the next step).",
    ],
    maxTurns: 4,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
  {
    name: "vacman-kb-price",
    scenario:
      "You are Maria, an HVAC technician at the job. After the greeting, ask: 'What do we charge to replace a Schrader core, and what's R-410A per pound?' Then say thanks and stop.",
    successConditions: [
      "The agent says a Schrader core replacement is $89.",
      "The agent says R-410A is $95 per pound.",
    ],
    maxTurns: 4,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
  {
    name: "vacman-kb-policy",
    scenario:
      "You are Maria, an HVAC technician at the job. After the greeting, ask: 'The customer wants a discount. Can I knock 20 percent off?' Then say thanks and stop.",
    successConditions: [
      "The agent says that the technician cannot change prices in the field.",
      "The agent tells the technician to call the office for a discount.",
    ],
    maxTurns: 4,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
  {
    name: "vacman-calc-superheat",
    scenario:
      "You are Maria, an HVAC technician. After the greeting, say: 'Suction is 105, suction line is 60, R-410A. What's my superheat?' Listen to the answer, then say 'Thanks' and stop.",
    successConditions: [
      "The agent calls the run_python tool, and the code uses hvac.saturation_temp.",
      "The agent says that the superheat is about 26 degrees.",
      "The agent says that the superheat is high, names low refrigerant charge (undercharge) as the most likely cause, and names a check that confirms it (for example subcooling or a leak search).",
      "The agent logs the reading as a measurement note with log_job_note.",
    ],
    maxTurns: 6,
    toolMocks: {
      run_python: "Saturation temperature: 34.0 F\nSuperheat: 26.0 F",
      log_job_note: NOTE_MOCKS,
    },
  },
  {
    name: "vacman-spanish-notes",
    scenario:
      "You are Maria, a bilingual HVAC technician. After the greeting, speak only Spanish. Say: 'Encontré la fuga en el Schrader de succión, cambié el core y agregué dos libras de refrigerante.' Listen to the answer, then say 'Gracias' and stop.",
    successConditions: [
      "The agent answers the technician in Spanish.",
      "The agent calls log_job_note, and the text of each note is in English, not Spanish.",
      "The notes include the Schrader core replacement with item code SCHR-CORE.",
      "The notes include 2 pounds of refrigerant with item code R410A-LB and quantity 2.",
    ],
    maxTurns: 6,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
  {
    name: "vacman-correction",
    scenario:
      "You are Maria, an HVAC technician. After the greeting, say: 'I also swapped the dual run capacitor.' After the agent answers, say: 'Actually no, scratch that, the capacitor tested fine, I didn't replace it.' Then say 'Thanks' and stop.",
    successConditions: [
      "The agent first logs the capacitor replacement with log_job_note.",
      "After the technician takes it back, the agent calls log_job_note with action remove and note_id n5.",
      "The agent confirms the removal in a few words.",
    ],
    maxTurns: 6,
    toolMocks: {
      log_job_note: NOTE_MOCKS,
    },
  },
  {
    name: "vacman-wrap-up",
    scenario:
      "You are Maria, an HVAC technician. The repair is done. After the greeting, say: 'Leak was at the suction Schrader core, I replaced the core and added two pounds of R-410A. Okay, wrap up the job.' When the agent reads back the items and the total and asks for confirmation, your next words must be exactly: 'Yes, send it.' After the agent confirms the invoice, say 'Thanks' and stop.",
    successConditions: [
      "Before any create_invoice call, the agent reads back the billable items and a total, and asks for confirmation.",
      "The agent calls create_invoice only after the technician says yes.",
      "After create_invoice, the agent says the invoice number INV-1042 and that the invoice went to the office for review.",
    ],
    maxTurns: 10,
    toolMocks: {
      log_job_note: NOTE_MOCKS,
      run_python: "Subtotal: $657.00\nTax (7.75%): $50.92\nTotal: $707.92",
      create_invoice: '{"invoice_number":"INV-1042","total":707.92,"status":"Sent to office for review"}',
    },
  },
  {
    name: "vacman-off-topic",
    scenario:
      "You are Maria, an HVAC technician. After the greeting, ask: 'Hey, random question, who do you think wins the Padres game tonight?' Listen to the answer, then say 'Ha, okay' and stop.",
    successConditions: [
      "The agent answers the off-topic question in one short line.",
      "In the same reply, the agent brings the technician back to the job with a next step or a job question.",
    ],
    maxTurns: 4,
    toolMocks: { log_job_note: NOTE_MOCKS },
  },
];

export const TEST_DYNAMIC_VARIABLES = DYNAMIC_VARIABLES;
