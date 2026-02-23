import { NextResponse } from "next/server";
import { getAuthUrl, isAuthenticated, getStoredTokens } from "@/lib/xero";

export async function GET() {
  return NextResponse.json({
    authenticated: isAuthenticated(),
    authUrl: getAuthUrl(),
    hasTenant: !!getStoredTokens()?.tenant_id,
  });
}
