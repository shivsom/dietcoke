"use client";

import type { ChunkMetrics } from "@/lib/types";

interface SplitViewProps {
  perChunk: ChunkMetrics[];
}

export function SplitView({ perChunk }: SplitViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200">Original context</h3>
          <span className="text-xs text-red-400/70">struck-through = removed</span>
        </div>
        <div className="space-y-4">
          {perChunk.map((chunk) => (
            <div key={chunk.chunkIndex}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Chunk {chunk.chunkIndex + 1}
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {chunk.sentences.map((s) =>
                  s.kept ? (
                    <span key={s.sentenceIndex}>{s.text} </span>
                  ) : (
                    <span
                      key={s.sentenceIndex}
                      className="text-red-400/70 line-through decoration-red-500/50"
                    >
                      {s.text}{" "}
                    </span>
                  ),
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200">Compressed context</h3>
          <span className="text-xs text-emerald-400/80">sent to the LLM</span>
        </div>
        <div className="space-y-4">
          {perChunk.map((chunk) => (
            <div key={chunk.chunkIndex}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Chunk {chunk.chunkIndex + 1}
              </p>
              {chunk.compressedText ? (
                <p className="text-sm leading-relaxed text-emerald-50/90">{chunk.compressedText}</p>
              ) : (
                <p className="text-sm italic text-slate-600">Everything stripped at this threshold.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
