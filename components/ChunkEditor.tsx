"use client";

interface ChunkEditorProps {
  query: string;
  onQueryChange: (value: string) => void;
  chunks: string[];
  onChunkChange: (index: number, value: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export function ChunkEditor({
  query,
  onQueryChange,
  chunks,
  onChunkChange,
  onAnalyze,
  onReset,
  isLoading,
}: ChunkEditorProps) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="query">
          Query
        </label>
        <input
          id="query"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="What are you asking the RAG system?"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-200">Retrieved chunks</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 transition hover:text-slate-300"
        >
          Reset to sample data
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {chunks.map((chunk, i) => (
          <div key={i}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Chunk {i + 1}
            </p>
            <textarea
              value={chunk}
              onChange={(e) => onChunkChange(i, e.target.value)}
              rows={8}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={isLoading}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Scoring sentences…" : "Analyze & Compress"}
      </button>
    </div>
  );
}
