import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_NORTHMODELLABS_API_KEY;
const API_URL = "https://api.atlasv1.com";

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Atlas API key not configured" },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  let body: BodyInit;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
  };

  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else {
    const json = await req.json();
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}/v1/realtime/session`, {
    method: "POST",
    headers,
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
