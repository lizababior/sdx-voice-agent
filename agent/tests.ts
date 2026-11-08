// Agent simulation tests. An LLM judge scores each success condition.
// Run with: npm run agent:test  (options: --only <name>  --k <trials>)
import { DYNAMIC_VARIABLES } from "./config.ts";

export type AgentTest = {
  name: string;
  // What the simulated technician says and does.
  scenario: string;
  // The judge passes the test when all of these are true.
  successConditions: string[];
  maxTurns: number;
  // Mocked tool results by tool name. Tools without a mock return a generic success.
  toolMocks?: Record<string, string>;
};

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
  },
  {
    name: "vacman-kb-fault-code",
    scenario:
      "You are Maria, an HVAC technician at the job. After the greeting, say: 'The outdoor board is flashing three short, two long. What does that mean?' Then say thanks and stop.",
    successConditions: [
      "The agent identifies the code as 32, a low-pressure switch trip (low pressure switch open).",
      "The agent tells the technician to check the refrigerant charge and the indoor airflow.",
    ],
    maxTurns: 4,
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
  },
];

export const TEST_DYNAMIC_VARIABLES = DYNAMIC_VARIABLES;
