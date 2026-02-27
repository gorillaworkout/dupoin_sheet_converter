export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getBalanceSheet,
  getProfitAndLoss,
  isAuthenticated,
  getStoredTokens,
  setTokens,
} from "@/lib/xero";

interface ReportCell {
  Value: string;
}

interface ReportRow {
  RowType: string;
  Title?: string;
  Cells?: ReportCell[];
  Rows?: ReportRow[];
}

interface XeroReportData {
  Reports?: {
    ReportName: string;
    ReportDate: string;
    Rows: ReportRow[];
  }[];
}

// Parse number from Xero value string
function parseAmount(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").replace(/[()]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : (value.includes("(") ? -num : num);
}

// Save Xero tokens to DB (persistent across container restarts)
async function saveTokensToDB() {
  const tokens = getStoredTokens();
  if (!tokens) return;

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

// Load tokens from DB on startup
async function loadTokensFromDB(): Promise<boolean> {
  try {
    const stored = await prisma.xeroToken.findUnique({ where: { id: 1 } });
    if (stored?.refreshToken) {
      setTokens({
        access_token: stored.accessToken,
        refresh_token: stored.refreshToken,
        expires_at: stored.expiresAt.getTime(),
        tenant_id: stored.tenantId || undefined,
      });
      return true;
    }
  } catch {
    // Table might not exist yet
  }
  return false;
}

// Sync Balance Sheet to DB
async function syncBalanceSheet(date?: string) {
  const data = (await getBalanceSheet(date)) as XeroReportData;
  const report = data?.Reports?.[0];
  if (!report) return { synced: 0 };

  // Save report
  const saved = await prisma.balanceSheetReport.create({
    data: {
      reportDate: report.ReportDate || date || new Date().toISOString().split("T")[0],
      rawJson: data as object,
    },
  });

  // Extract rows
  const rows: { section: string; accountName: string; value: number; period: string }[] = [];
  const headers = report.Rows.find((r) => r.RowType === "Header");
  const periods = headers?.Cells?.slice(1).map((c) => c.Value) || ["Current"];

  for (const section of report.Rows.filter((r) => r.RowType === "Section")) {
    const sectionTitle = section.Title || "Other";
    if (!section.Rows) continue;

    for (const row of section.Rows) {
      if (!row.Cells || row.Cells.length < 2) continue;
      const accountName = row.Cells[0].Value;
      if (!accountName) continue;

      // Each period column
      for (let i = 1; i < row.Cells.length; i++) {
        const value = parseAmount(row.Cells[i].Value);
        if (value === 0) continue;
        rows.push({
          section: sectionTitle,
          accountName,
          value,
          period: periods[i - 1] || `Period ${i}`,
        });
      }
    }
  }

  // Bulk insert
  if (rows.length > 0) {
    await prisma.balanceSheetRow.createMany({
      data: rows.map((r) => ({
        reportId: saved.id,
        section: r.section,
        accountName: r.accountName,
        value: r.value,
        period: r.period,
      })),
    });
  }

  return { reportId: saved.id, synced: rows.length };
}

// Sync Profit & Loss to DB
async function syncProfitLoss(fromDate?: string, toDate?: string) {
  const data = (await getProfitAndLoss(fromDate, toDate)) as XeroReportData;
  const report = data?.Reports?.[0];
  if (!report) return { synced: 0 };

  const saved = await prisma.profitLossReport.create({
    data: {
      fromDate: fromDate || "",
      toDate: toDate || report.ReportDate || "",
      rawJson: data as object,
    },
  });

  const rows: { section: string; accountName: string; value: number; period: string }[] = [];
  const headers = report.Rows.find((r) => r.RowType === "Header");
  const periods = headers?.Cells?.slice(1).map((c) => c.Value) || ["Current"];

  for (const section of report.Rows.filter((r) => r.RowType === "Section")) {
    const sectionTitle = section.Title || "Other";
    if (!section.Rows) continue;

    for (const row of section.Rows) {
      if (!row.Cells || row.Cells.length < 2) continue;
      const accountName = row.Cells[0].Value;
      if (!accountName) continue;

      for (let i = 1; i < row.Cells.length; i++) {
        const value = parseAmount(row.Cells[i].Value);
        if (value === 0) continue;
        rows.push({
          section: sectionTitle,
          accountName,
          value,
          period: periods[i - 1] || `Period ${i}`,
        });
      }
    }
  }

  if (rows.length > 0) {
    await prisma.profitLossRow.createMany({
      data: rows.map((r) => ({
        reportId: saved.id,
        section: r.section,
        accountName: r.accountName,
        value: r.value,
        period: r.period,
      })),
    });
  }

  return { reportId: saved.id, synced: rows.length };
}

export async function POST(req: NextRequest) {
  try {
    // Try load tokens from DB if not in memory
    if (!isAuthenticated()) {
      const loaded = await loadTokensFromDB();
      if (!loaded) {
        return NextResponse.json(
          { error: "Not authenticated. Connect Xero first." },
          { status: 401 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const fromDate = body.fromDate || "2025-02-01";
    const toDate = body.toDate || "2025-03-31";

    // Sync both reports
    const [bs, pl] = await Promise.all([
      syncBalanceSheet(toDate),
      syncProfitLoss(fromDate, toDate),
    ]);

    // Save tokens to DB after successful sync
    await saveTokensToDB();

    return NextResponse.json({
      success: true,
      balanceSheet: bs,
      profitLoss: pl,
      message: `Synced ${bs.synced} balance sheet rows and ${pl.synced} P&L rows to database`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", message: String(error) },
      { status: 500 }
    );
  }
}
