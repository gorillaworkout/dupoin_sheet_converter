"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RowChartProps {
  title: string;
  labels: string[];
  values: number[];
}

function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatFull(value: number): string {
  return value.toLocaleString("id-ID");
}

export function RowChart({ title, labels, values }: RowChartProps) {
  const data = labels.map((label, i) => ({
    name: label,
    value: values[i] ?? 0,
  }));

  const hasNegative = values.some((v) => v < 0);
  const gradientId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <h3 className="mb-3 truncate text-sm font-medium text-zinc-300" title={title}>
        {title}
      </h3>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hasNegative ? "#f59e0b" : "#06b6d4"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={hasNegative ? "#f59e0b" : "#06b6d4"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompact}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(24, 24, 27, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e4e4e7",
              }}
              formatter={(value: number | undefined) => [formatFull(value ?? 0), title]}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={hasNegative ? "#f59e0b" : "#06b6d4"}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: hasNegative ? "#f59e0b" : "#06b6d4",
                stroke: "rgba(0,0,0,0.3)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
