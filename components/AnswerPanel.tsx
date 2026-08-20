"use client";

import { useState } from "react";

interface AnswerPanelProps {
  query: string;
  compressedContext: string;
}

export function AnswerPanel({ query, compressedContext }: AnswerPanelProps) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseMs, setResponseMs] = useState<number | null>(null);

  const disabled = !compressedContext.trim() || !query.trim();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setAnswer(null);
    setResponseMs(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, compressedContext }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setAnswer(data.answer);
      setResponseMs(data.responseMs);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Ask Llama 3.3 70B (free)</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Proves the compressed context alone is still enough to answer correctly.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled || loading}
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Asking…" : "Generate answer"}
        </button>
      </div>

      {disabled && !loading && (
        <p className="text-xs text-amber-400/80">
          Nothing left to send — lower the threshold so at least one sentence survives.
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/10" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
      )}

      {answer && !loading && (
        <div className="animate-fade-in space-y-2">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{answer}</p>
          {responseMs !== null && (
            <p className="text-xs text-slate-500">
              Response time: <span className="tabular text-slate-400">{responseMs}ms</span> · sent only
              the compressed context above
            </p>
          )}
        </div>
      )}
    </div>
  );
}
