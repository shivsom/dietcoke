import { wordTokenize } from "./textUtils";

// Standard Okapi BM25 constants.
const K1 = 1.5;
const B = 0.75;

export interface BM25Doc {
  text: string;
}

/**
 * Scores each sentence against the query using BM25 — the same family of
 * lightweight, local lexical rankers named in the brief (as an alternative to
 * a cross-encoder). IDF is computed over the full retrieved sentence corpus,
 * so terms that are rare across the retrieved chunks score higher than
 * generic words that show up everywhere.
 */
export function scoreBM25(query: string, sentences: BM25Doc[]): number[] {
  const queryTerms = wordTokenize(query);
  const docs = sentences.map((s) => wordTokenize(s.text));
  const n = docs.length;
  if (n === 0 || queryTerms.length === 0) return docs.map(() => 0);

  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / n;

  const documentFreq = new Map<string, number>();
  for (const doc of docs) {
    for (const term of new Set(doc)) {
      documentFreq.set(term, (documentFreq.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, freq] of documentFreq.entries()) {
    idf.set(term, Math.log((n - freq + 0.5) / (freq + 0.5) + 1));
  }

  return docs.map((doc) => {
    if (doc.length === 0) return 0;
    const termFreq = new Map<string, number>();
    for (const term of doc) termFreq.set(term, (termFreq.get(term) ?? 0) + 1);

    let score = 0;
    for (const qTerm of queryTerms) {
      const f = termFreq.get(qTerm);
      if (!f) continue;
      const termIdf = idf.get(qTerm) ?? 0;
      const numerator = f * (K1 + 1);
      const denominator = f + K1 * (1 - B + (B * doc.length) / avgdl);
      score += termIdf * (numerator / denominator);
    }
    return score;
  });
}

/** Min-max normalize raw BM25 scores to [0, 1] so a 0-100% slider can filter them. */
export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  if (max === min) {
    return scores.map(() => (max > 0 ? 1 : 0));
  }
  return scores.map((s) => (s - min) / (max - min));
}
