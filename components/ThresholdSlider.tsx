"use client";

import type { CSSProperties } from "react";

interface ThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ThresholdSlider({ value, onChange }: ThresholdSliderProps) {
  const sliderStyle = { "--slider-fill": `${value}%` } as CSSProperties;

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Relevance threshold</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Sentences scoring below this are stripped before the LLM ever sees them.
          </p>
        </div>
        <span className="tabular shrink-0 text-2xl font-semibold text-emerald-400">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="diet-slider"
        style={sliderStyle}
        aria-label="Relevance threshold percentage"
      />
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>0% · keep everything</span>
        <span>100% · max compression</span>
      </div>
    </div>
  );
}
