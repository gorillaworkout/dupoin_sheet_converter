import { NextRequest, NextResponse } from "next/server";
import { setTokens, getBalanceSheet, isAuthenticated } from "@/lib/xero";

export async function GET(req: NextRequest) {
  // Accept initial token via query param (one-time setup)
  const token = req.nextUrl.searchParams.get("token");
  const refresh = req.nextUrl.searchParams.get("refresh");
  const date = req.nextUrl.searchParams.get("date") || undefined;

  if (token && refresh) {
    setTokens({
      access_token: token,
      refresh_token: refresh,
      expires_at: Date.now() + 1800 * 1000,
    });
  }

  if (!isAuthenticated()) {
    return NextResponse.json(
      { error: "Not authenticated. Connect Xero first." },
      { status: 401 }
    );
  }

  try {
    const data = await getBalanceSheet(date);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Balance sheet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance sheet", message: String(error) },
      { status: 500 }
    );
  }
}
