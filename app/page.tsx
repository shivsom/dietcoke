"use client";

import { useEffect, useMemo, useState } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ChunkEditor } from "@/components/ChunkEditor";
import { MetricCard } from "@/components/MetricCard";
import { SplitView } from "@/components/SplitView";
import { ThresholdSlider } from "@/components/ThresholdSlider";
import { TokenChart } from "@/components/TokenChart";
import { applyThreshold } from "@/lib/metrics";
import { DEFAULT_CHUNKS, DEFAULT_QUERY } from "@/lib/sampleData";
import type { ScoredChunk } from "@/lib/types";

const DEFAULT_THRESHOLD = 45;

export default function Home() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [chunks, setChunks] = useState<string[]>(DEFAULT_CHUNKS);
  const [scoredChunks, setScoredChunks] = useState<ScoredChunk[] | null>(null);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  async function handleAnalyze(q = query, c = chunks) {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, chunks: c }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalyzeError(data.error ?? "Failed to compress context.");
        return;
      }
      setScoredChunks(data.chunks);
    } catch {
      setAnalyzeError("Network error — could not reach the server.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Populate the dashboard immediately with the sample data on first load.
  useEffect(() => {
    handleAnalyze(DEFAULT_QUERY, DEFAULT_CHUNKS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReset() {
    setQuery(DEFAULT_QUERY);
    setChunks(DEFAULT_CHUNKS);
    handleAnalyze(DEFAULT_QUERY, DEFAULT_CHUNKS);
  }

  function handleChunkChange(index: number, value: string) {
    setChunks((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  const metrics = useMemo(
    () => (scoredChunks ? applyThreshold(scoredChunks, threshold) : null),
    [scoredChunks, threshold],
  );

  const chartData = useMemo(() => {
    if (!metrics) return [];
    return [
      ...metrics.perChunk.map((c) => ({
        name: `Chunk ${c.chunkIndex + 1}`,
        original: c.originalTokens,
        compressed: c.compressedTokens,
      })),
      {
        name: "Total",
        original: metrics.totalOriginalTokens,
        compressed: metrics.totalCompressedTokens,
      },
    ];
  }, [metrics]);

  const compressedContext = useMemo(
    () =>
      metrics
        ? metrics.perChunk
            .map((c) => c.compressedText)
            .filter(Boolean)
            .join("\n\n")
        : "",
    [metrics],
  );

  return (
    <main className="bg-grid min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 animate-fade-in">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              BM25 · local scoring
            </span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              Real BPE token counts
            </span>
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
              Llama 3.3 70B · free
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Token-Diet
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            A post-retrieval compressor for RAG. Score every retrieved sentence locally with BM25,
            strip the filler below your threshold, and send only the dense, information-rich
            remainder to the LLM.
          </p>
        </header>

        <div className="space-y-6">
          <ChunkEditor
            query={query}
            onQueryChange={setQuery}
            chunks={chunks}
            onChunkChange={handleChunkChange}
            onAnalyze={() => handleAnalyze()}
            onReset={handleReset}
            isLoading={isAnalyzing}
          />

          {analyzeError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {analyzeError}
            </div>
          )}

          <ThresholdSlider value={threshold} onChange={setThreshold} />

          {metrics && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Tokens saved"
                  value={metrics.tokensSavedPct}
                  suffix="%"
                  decimals={0}
                  gradient="from-emerald-400 to-teal-500"
                  caption={`${metrics.totalOriginalTokens} → ${metrics.totalCompressedTokens} tokens`}
                />
                <MetricCard
                  label="Compression ratio"
                  value={metrics.compressionRatio}
                  suffix="×"
                  decimals={1}
                  gradient="from-cyan-400 to-blue-500"
                  caption="original size ÷ compressed size"
                />
                <MetricCard
                  label="Est. latency drop"
                  value={metrics.estLatencyDropMs}
                  suffix="ms"
                  decimals={0}
                  gradient="from-violet-400 to-fuchsia-500"
                  caption="estimated TTFT improvement"
                />
              </div>

              <TokenChart data={chartData} />
              <SplitView perChunk={metrics.perChunk} />
              <AnswerPanel query={query} compressedContext={compressedContext} />
            </>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-600">
          Compression runs entirely locally (BM25 + BPE tokenization) — no LLM call is made until you
          click &quot;Generate answer&quot;.
        </footer>
      </div>
    </main>
  );
}
