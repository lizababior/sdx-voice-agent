// Runs the simulation tests in agent/tests.ts against the ElevenLabs agent.
// Run with: npm run agent:test  (options: --only <name>  --k <trials>)
import { ElevenLabsClient, type ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { TESTS, TEST_DYNAMIC_VARIABLES } from "../agent/tests.ts";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const agentId = process.env.ELEVENLABS_AGENT_ID!;

const arg = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const only = arg("--only");
const k = Number(arg("--k") ?? 1);
const selected = TESTS.filter((t) => !only || t.name === only);

const line = "=".repeat(64);
console.log(`${line}\n VacMan agent tests  ·  ${selected.length} test(s)  ·  k=${k}\n${line}`);

// Tool IDs by name, for the mocks.
const { tools } = await client.conversationalAi.tools.list();
const toolIdByName = Object.fromEntries(
  tools.flatMap((t) => ("name" in t.toolConfig ? [[t.toolConfig.name, t.id]] : [])),
);

// Create or update each test by name, so a second run does not duplicate tests.
const existing = (await client.conversationalAi.tests.list({ pageSize: 100 })).tests;
const testIds: Record<string, string> = {};
for (const t of selected) {
  const body: ElevenLabs.conversationalAi.TestsCreateRequestBody = {
    type: "simulation",
    name: t.name,
    simulationScenario: t.scenario,
    successConditions: t.successConditions,
    simulationMaxTurns: t.maxTurns,
    dynamicVariables: TEST_DYNAMIC_VARIABLES,
    toolMockConfig: { mockingStrategy: "all", fallbackStrategy: "raise_error" },
    toolMockOverrides: Object.fromEntries(
      Object.entries(t.toolMocks ?? {}).map(([name, result]) => [toolIdByName[name], [{ mockResult: result }]]),
    ),
  };
  const match = existing.find((e) => e.name === t.name);
  if (match) {
    await client.conversationalAi.tests.update(match.id, body);
    testIds[t.name] = match.id;
  } else {
    testIds[t.name] = (await client.conversationalAi.tests.create(body)).id;
  }
}

// Run and poll until no run is pending.
let invocation = await client.conversationalAi.agents.runTests(agentId, {
  tests: Object.values(testIds).map((testId) => ({ testId })),
  repeatCount: k,
});
while (invocation.testRuns.some((r) => r.status === "pending")) {
  await new Promise((r) => setTimeout(r, 3000));
  invocation = await client.conversationalAi.tests.invocations.get(invocation.id);
}

// Per-trial lines.
const summary: Record<string, { pass: number; total: number }> = {};
for (const run of invocation.testRuns) {
  const name = Object.keys(testIds).find((n) => testIds[n] === run.testId) ?? run.testId;
  summary[name] ??= { pass: 0, total: 0 };
  summary[name].total++;
  const ok = run.status === "passed";
  if (ok) summary[name].pass++;
  console.log(`\n${ok ? "PASS" : "FAIL"}  ${name}  (trial ${summary[name].total}/${k})`);
  for (const turn of run.agentResponses ?? []) {
    if (turn.message) console.log(`        ${turn.role.padEnd(5)} ${turn.message}`);
    for (const call of turn.toolCalls ?? []) console.log(`        tool  ${call.toolName} ${call.paramsAsJson}`);
  }
  const rationale = run.conditionResult?.rationale;
  if (!ok && rationale) console.log(`        judge ${JSON.stringify(rationale)}`);
}

// pass@k table.
console.log(`\n${line}\n ${"test".padEnd(36)} ${"passed".padEnd(10)} pass@${k}\n${line}`);
let failed = false;
for (const [name, s] of Object.entries(summary)) {
  const passAtK = s.pass > 0;
  if (s.pass < s.total) failed = true;
  console.log(` ${name.padEnd(36)} ${`${s.pass}/${s.total}`.padEnd(10)} ${passAtK ? "PASS" : "FAIL"}`);
}
console.log(line);
process.exit(failed ? 1 : 0);
