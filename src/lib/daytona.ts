import { Daytona } from "@daytonaio/sdk";

export type Language = "python" | "typescript" | "javascript";

let daytona: Daytona | undefined;

/** Runs code in a fresh, ephemeral Daytona sandbox and deletes it afterwards. */
export async function runCode(code: string, language: Language = "python") {
  daytona ??= new Daytona(); // reads DAYTONA_API_KEY
  const sandbox = await daytona.create({ language, ephemeral: true, autoStopInterval: 5 });
  try {
    const res = await sandbox.process.codeRun(code, undefined, 30);
    return { exitCode: res.exitCode, output: res.result };
  } finally {
    await sandbox.delete().catch(() => {});
  }
}
