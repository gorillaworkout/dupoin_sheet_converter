import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/xero";
import { prisma } from "@/lib/db";
import { getStoredTokens } from "@/lib/xero";

const BASE_URL = "https://hr-app.gorillaworkout.id";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/xero?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/xero?error=no_code`);
  }

  try {
    await exchangeCode(code);

    // Save tokens to DB (persistent)
    const tokens = getStoredTokens();
    if (tokens) {
      await prisma.xeroToken.upsert({
        where: { id: 1 },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expires_at),
          tenantId: tokens.tenant_id,
        },
        create: {
          id: 1,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(tokens.expires_at),
          tenantId: tokens.tenant_id,
        },
      });
    }

    return NextResponse.redirect(`${BASE_URL}/dashboard/xero?connected=true`);
  } catch (e) {
    console.error("Xero OAuth error:", e);
    return NextResponse.redirect(
      `${BASE_URL}/dashboard/xero?error=exchange_failed`
    );
  }
}
