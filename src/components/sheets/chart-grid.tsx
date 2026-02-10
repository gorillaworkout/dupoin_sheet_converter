"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RowChart } from "./row-chart";

interface ChartGridProps {
  headers: string[];
  rows: string[][];
}

function parseNumeric(value: string): number | null {
  if (!value || value.trim() === "") return null;
  const cleaned = value.replace(/[,\s]/g, "").replace(/^[^\d\-.]+/, "");
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

function isDataRow(row: string[]): boolean {
  const numericCells = row.slice(1).filter((cell) => parseNumeric(cell) !== null);
  return numericCells.length > 0;
}

export function ChartGrid({ headers, rows }: ChartGridProps) {
  const chartData = useMemo(() => {
    const xLabels = headers.slice(1);

    return rows
      .filter(isDataRow)
      .map((row) => ({
        title: row[0] || "Tanpa Judul",
        labels: xLabels,
        values: row.slice(1).map((cell) => parseNumeric(cell) ?? 0),
      }));
  }, [headers, rows]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-sm text-zinc-500">
        Tidak ada data numerik untuk ditampilkan sebagai grafik
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    >
      {chartData.map((item, i) => (
        <motion.div
          key={`${item.title}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <RowChart
            title={item.title}
            labels={item.labels}
            values={item.values}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
