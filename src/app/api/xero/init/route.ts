export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { setTokens } from "@/lib/xero";
import { prisma } from "@/lib/db";

// POST /api/xero/init — seed tokens from the initial OAuth response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { access_token, refresh_token, expires_in } = body;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "access_token and refresh_token required" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + (expires_in || 1800) * 1000);

    // Save to memory
    setTokens({
      access_token,
      refresh_token,
      expires_at: expiresAt.getTime(),
    });

    // Save to DB (persistent)
    await prisma.xeroToken.upsert({
      where: { id: 1 },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
      create: {
        id: 1,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, persistent: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set tokens", message: String(error) },
      { status: 500 }
    );
  }
}
