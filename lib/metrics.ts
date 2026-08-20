import type { AnnotatedSentence, ChunkMetrics, CompressionMetrics, ScoredChunk } from "./types";

// Heuristic: ~180ms of prefill/TTFT latency per 1,000 prompt tokens, in line
// with typical prefill throughput for a 70B-class model. This is an estimate
// used for the dashboard card, not a measured value.
const TTFT_MS_PER_1K_TOKENS = 180;

/**
 * Pure, dependency-free filtering + metrics math. Runs on the client so the
 * threshold slider updates instantly against sentence scores already fetched
 * from /api/compress, with no extra network round-trip per tick.
 */
export function applyThreshold(chunks: ScoredChunk[], thresholdPct: number): CompressionMetrics {
  const perChunk: ChunkMetrics[] = chunks.map((chunk) => {
    const sentences: AnnotatedSentence[] = chunk.sentences.map((s) => ({
      ...s,
      kept: s.normalizedScore * 100 >= thresholdPct,
    }));
    const kept = sentences.filter((s) => s.kept);

    return {
      chunkIndex: chunk.chunkIndex,
      sentences,
      compressedText: kept.map((s) => s.text).join(" "),
      originalTokens: chunk.originalTokens,
      compressedTokens: kept.reduce((sum, s) => sum + s.tokenCount, 0),
    };
  });

  const totalOriginalTokens = perChunk.reduce((sum, c) => sum + c.originalTokens, 0);
  const totalCompressedTokens = perChunk.reduce((sum, c) => sum + c.compressedTokens, 0);
  const tokensSaved = totalOriginalTokens - totalCompressedTokens;
  const tokensSavedPct = totalOriginalTokens > 0 ? (tokensSaved / totalOriginalTokens) * 100 : 0;
  const compressionRatio =
    totalCompressedTokens > 0
      ? totalOriginalTokens / totalCompressedTokens
      : totalOriginalTokens > 0
        ? Infinity
        : 1;

  return {
    perChunk,
    totalOriginalTokens,
    totalCompressedTokens,
    tokensSavedPct,
    compressionRatio,
    estLatencyDropMs: (tokensSaved / 1000) * TTFT_MS_PER_1K_TOKENS,
  };
}
