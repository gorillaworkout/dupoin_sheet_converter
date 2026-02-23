import { NextRequest, NextResponse } from "next/server";
import { setTokens, getProfitAndLoss, isAuthenticated } from "@/lib/xero";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const refresh = req.nextUrl.searchParams.get("refresh");
  const fromDate = req.nextUrl.searchParams.get("from") || undefined;
  const toDate = req.nextUrl.searchParams.get("to") || undefined;

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
    const data = await getProfitAndLoss(fromDate, toDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profit & loss error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profit & loss", message: String(error) },
      { status: 500 }
    );
  }
}
