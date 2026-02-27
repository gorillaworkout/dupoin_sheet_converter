"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown, DollarSign, DatabaseBackup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportRow {
  RowType: string;
  Title?: string;
  Cells?: { Value: string }[];
  Rows?: ReportRow[];
}

interface XeroReport {
  Reports?: {
    ReportID: string;
    ReportName: string;
    ReportDate: string;
    Rows: ReportRow[];
  }[];
}

// Format number as Rupiah (Rp 1.234.567)
function formatRupiah(value: string): string {
  if (!value) return value;
  // Check if it's a number (possibly with decimals)
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return value;
  
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const formatted = absNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  if (isNegative) return `(Rp ${formatted})`;
  if (num === 0) return "Rp 0";
  return `Rp ${formatted}`;
}

// Format cell value — only format numeric values in non-header columns
function formatCellValue(value: string, colIndex: number): string {
  if (colIndex === 0) return value; // First column is always label
  return formatRupiah(value);
}

function ReportTable({ report, title }: { report: XeroReport | null; title: string }) {
  if (!report?.Reports?.[0]) {
    return (
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const data = report.Reports[0];
  const headers = data.Rows.find((r) => r.RowType === "Header");
  const sections = data.Rows.filter((r) => r.RowType === "Section");
  const summary = data.Rows.find((r) => r.RowType === "SummaryRow");

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          {data.ReportName}
        </CardTitle>
        <p className="text-xs text-zinc-500">{data.ReportDate}</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {headers?.Cells && (
              <thead>
                <tr className="border-b border-white/5">
                  {headers.Cells.map((cell, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 ${
                        i > 0 ? "text-right" : "text-left"
                      }`}
                    >
                      {cell.Value}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {sections.map((section, sIdx) => (
                <>
                  {section.Title && (
                    <tr key={`title-${sIdx}`} className="border-b border-white/5 bg-white/[0.02]">
                      <td
                        colSpan={headers?.Cells?.length || 4}
                        className="px-4 py-2 text-sm font-semibold text-white"
                      >
                        {section.Title}
                      </td>
                    </tr>
                  )}
                  {section.Rows?.map((row, rIdx) => {
                    if (row.RowType === "SummaryRow") {
                      return (
                        <tr key={`sum-${sIdx}-${rIdx}`} className="border-b border-white/5 bg-cyan-500/5">
                          {row.Cells?.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-2 font-semibold text-cyan-400 ${
                                cIdx > 0 ? "text-right" : "text-left"
                              }`}
                            >
                              {formatCellValue(cell.Value, cIdx)}
                            </td>
                          ))}
                        </tr>
                      );
                    }
                    return (
                      <tr key={`row-${sIdx}-${rIdx}`} className="border-b border-white/5 hover:bg-white/[0.02]">
                        {row.Cells?.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-1.5 text-zinc-300 ${
                              cIdx > 0 ? "text-right tabular-nums" : "text-left"
                            }`}
                          >
                            {formatCellValue(cell.Value, cIdx)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </>
              ))}
              {summary?.Cells && (
                <tr className="bg-cyan-500/10 border-t-2 border-cyan-500/30">
                  {summary.Cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 text-sm font-bold text-white ${
                        i > 0 ? "text-right tabular-nums" : "text-left"
                      }`}
                    >
                      {formatCellValue(cell.Value, i)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function XeroClient() {
  const [status, setStatus] = useState<{
    authenticated: boolean;
    authUrl: string;
  } | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<XeroReport | null>(null);
  const [profitLoss, setProfitLoss] = useState<XeroReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"balance" | "pnl">("balance");
  const [dateFrom, setDateFrom] = useState("2025-02-01");
  const [dateTo, setDateTo] = useState("2025-03-31");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/xero/status");
      const data = await res.json();
      setStatus(data);
      return data.authenticated;
    } catch {
      return false;
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bsRes, plRes] = await Promise.all([
        fetch(`/api/xero/balance-sheet?date=${dateTo}`),
        fetch(`/api/xero/profit-loss?from=${dateFrom}&to=${dateTo}`),
      ]);

      if (!bsRes.ok || !plRes.ok) {
        const errData = await (bsRes.ok ? plRes : bsRes).json();
        throw new Error(errData.error || "Failed to fetch reports");
      }

      setBalanceSheet(await bsRes.json());
      setProfitLoss(await plRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  const syncToDb = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/xero/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate: dateFrom, toDate: dateTo }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(
          `✅ Synced ${data.balanceSheet?.synced || 0} Balance Sheet rows & ${data.profitLoss?.synced || 0} P&L rows to database`
        );
      } else {
        setSyncResult(`❌ ${data.error || "Sync failed"}`);
      }
    } catch (e) {
      setSyncResult(`❌ ${e instanceof Error ? e.message : "Sync failed"}`);
    } finally {
      setSyncing(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    checkStatus().then((authenticated) => {
      if (authenticated) {
        fetchReports();
      } else {
        setLoading(false);
      }
    });
  }, [checkStatus, fetchReports]);

  // Check URL params for callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      window.history.replaceState({}, "", "/dashboard/xero");
      checkStatus().then((auth) => {
        if (auth) fetchReports();
      });
    }
    if (params.get("error")) {
      setError(`Xero connection error: ${params.get("error")}`);
      window.history.replaceState({}, "", "/dashboard/xero");
      setLoading(false);
    }
  }, [checkStatus, fetchReports]);

  // Not connected
  if (!loading && status && !status.authenticated) {
    return (
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">Connect to Xero</h2>
          <p className="text-sm text-zinc-400 text-center max-w-md">
            Connect your Xero account to view Balance Sheet and Profit & Loss reports directly in the dashboard.
          </p>
          <a href={status.authUrl}>
            <Button className="gap-2 bg-cyan-600 text-white hover:bg-cyan-700">
              <ExternalLink className="h-4 w-4" />
              Connect Xero Account
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-zinc-500">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-200 focus:border-cyan-500/50 focus:outline-none"
        />
        <label className="text-xs font-medium text-zinc-500">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-200 focus:border-cyan-500/50 focus:outline-none"
        />
        <Button
          size="sm"
          className="bg-cyan-600 text-white hover:bg-cyan-700"
          onClick={fetchReports}
          disabled={loading}
        >
          Apply
        </Button>
      </div>

      {/* Tab selector + refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("balance")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "balance"
                ? "bg-cyan-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab("pnl")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "pnl"
                ? "bg-cyan-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            Profit & Loss
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 text-zinc-400 hover:text-white"
            onClick={fetchReports}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={syncToDb}
            disabled={syncing || loading}
          >
            <DatabaseBackup className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync to DB"}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Sync Result */}
      {syncResult && (
        <div
          className={`rounded-lg border p-4 ${
            syncResult.startsWith("✅")
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <p
            className={`text-sm ${
              syncResult.startsWith("✅") ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {syncResult}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="ml-3 text-sm text-zinc-400">Loading reports from Xero...</span>
        </div>
      )}

      {/* Reports */}
      {!loading && !error && (
        <div className={activeTab === "balance" ? "" : "hidden"}>
          <ReportTable report={balanceSheet} title="Balance Sheet" />
        </div>
      )}
      {!loading && !error && (
        <div className={activeTab === "pnl" ? "" : "hidden"}>
          <ReportTable report={profitLoss} title="Profit & Loss" />
        </div>
      )}
    </div>
  );
}
