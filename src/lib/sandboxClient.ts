// One sandbox start per page load. React strict mode runs effects twice in dev,
// and a second start would delete the first sandbox. The home page also calls this,
// so the sandbox is often warm by the time the tech opens the job.
let sandboxStart: Promise<string> | null = null;

export function warmSandbox(): Promise<string> {
  // The timeout turns a stuck request (for example a dev server restart) into the failed state,
  // which shows a Retry button. Without it, the page waits forever.
  sandboxStart ??= fetch("/api/sandbox/start", { method: "POST", signal: AbortSignal.timeout(60_000) })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.status !== "warm") throw new Error(data.error ?? "Sandbox failed");
      return data.sandboxId as string;
    })
    .catch((err) => {
      sandboxStart = null;
      throw err;
    });
  return sandboxStart;
}
