import { runCode, type Language } from "@/lib/daytona";

export const maxDuration = 60;

export async function POST(request: Request) {
  // This route runs code on our Daytona credits. Do not expose it on Vercel.
  if (process.env.VERCEL) return new Response("Not found", { status: 404 });
  const { code, language } = (await request.json()) as { code?: string; language?: Language };
  if (!code) return Response.json({ error: "code is required" }, { status: 400 });
  try {
    return Response.json(await runCode(code, language));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
