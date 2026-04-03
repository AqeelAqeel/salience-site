import OpenAI from "openai";

const getOpenAI = () =>
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("OpenAI API key not configured", { status: 500 });
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
    return new Response("Failed to synthesize speech", { status: 500 });
  }
}
