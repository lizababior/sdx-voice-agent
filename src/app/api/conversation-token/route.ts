import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Mints a short-lived WebRTC token so the API key never reaches the browser.
export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return Response.json({ error: "ELEVENLABS_AGENT_ID is not set. Run npm run agent:setup." }, { status: 500 });
  }
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  const { token } = await client.conversationalAi.conversations.getWebrtcToken({ agentId });
  return Response.json({ token });
}
