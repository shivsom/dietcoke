"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  caption?: string;
  gradient: string;
}

export function MetricCard({
  label,
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  caption,
  gradient,
}: MetricCardProps) {
  const animated = useCountUp(value);
  const display = Number.isFinite(value) ? animated.toFixed(decimals) : "∞";

  return (
    <div className="glass-card group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} aria-hidden />
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30`}
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="tabular mt-2 text-4xl font-semibold text-white">
        {prefix}
        {display}
        <span className="ml-0.5 text-xl text-slate-400">{suffix}</span>
      </p>
      {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
