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
];

export const TEST_DYNAMIC_VARIABLES = DYNAMIC_VARIABLES;
