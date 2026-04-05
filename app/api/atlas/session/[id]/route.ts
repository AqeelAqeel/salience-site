import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_NORTHMODELLABS_API_KEY;
const API_URL = "https://api.atlasv1.com";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Atlas API key not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${API_URL}/v1/realtime/session/${id}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Atlas API key not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${API_URL}/v1/realtime/session/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
