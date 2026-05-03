import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_BASE}/api/plan-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[api/plan-drafts] proxy error:", e);
    return NextResponse.json(
      { success: false, data: null, error: { code: "PROXY_ERROR", message: "백엔드 요청 실패" } },
      { status: 502 }
    );
  }
}
