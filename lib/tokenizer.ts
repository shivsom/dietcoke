import { encode } from "gpt-tokenizer";

/**
 * Real BPE token counts (cl100k_base) rather than a word-count heuristic, so
 * the dashboard's "tokens saved" numbers are the actual metric that drives
 * LLM cost and TTFT, not an approximation of it.
 */
export function countTextTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return encode(trimmed).length;
}
