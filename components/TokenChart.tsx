"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TokenChartProps {
  data: { name: string; original: number; compressed: number }[];
}

export function TokenChart({ data }: TokenChartProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-200">Tokens before vs. after</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={6}>
            <defs>
              <linearGradient id="originalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#475569" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="compressedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#0f1420",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} iconType="circle" iconSize={8} />
            <Bar
              dataKey="original"
              name="Original"
              fill="url(#originalGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={400}
            />
            <Bar
              dataKey="compressed"
              name="Compressed"
              fill="url(#compressedGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
