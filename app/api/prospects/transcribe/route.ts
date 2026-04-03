import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

const getOpenAI = () =>
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured", text: "" },
        { status: 200 } // Return 200 so frontend doesn't crash
      );
    }

    const formData = await request.formData();
    const audioBlob = formData.get("audio") as File | null;

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio file", text: "" });
    }

    // Convert the incoming File/Blob to a proper format for the SDK
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = await toFile(buffer, "audio.webm", { type: "audio/webm" });

    const openai = getOpenAI();

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    return NextResponse.json({ text: transcription.text || "" });
  } catch (error) {
    console.error("Transcription error:", error);
    // Return 200 with empty text so the frontend doesn't break
    return NextResponse.json({ text: "", error: "Transcription failed" });
  }
}
