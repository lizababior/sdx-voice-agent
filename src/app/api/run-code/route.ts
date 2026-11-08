import { runCode, type Language } from "@/lib/daytona";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { code, language } = (await request.json()) as { code?: string; language?: Language };
  if (!code) return Response.json({ error: "code is required" }, { status: 400 });
  try {
    return Response.json(await runCode(code, language));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
