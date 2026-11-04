import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://scamshield-u6c4.onrender.com";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "ScamShield-KeepAlive-Bot/1.0" },
    });

    clearTimeout(timeoutId);

    return NextResponse.json({
      status: "ok",
      backend_status: res.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "ping_dispatched",
        error: err?.message || "Wakeup ping delivered to backend",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

