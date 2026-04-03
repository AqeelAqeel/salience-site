import OpenAI from "openai";

const getOpenAI = () =>
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return 204 No Content — TTS is optional, frontend handles gracefully
      return new Response(null, { status: 204 });
    }

    const { text, voice } = (await request.json()) as {
      text: string;
      voice?: string;
    };

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    const openai = getOpenAI();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: (voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer") || "nova",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS synthesis error:", error);
    // TTS is optional — don't break the flow
    return new Response(null, { status: 204 });
  }
}
