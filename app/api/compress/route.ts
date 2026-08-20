import { NextRequest, NextResponse } from "next/server";
import { splitSentences } from "@/lib/textUtils";
import { scoreBM25, normalizeScores } from "@/lib/bm25";
import { countTextTokens } from "@/lib/tokenizer";
import type { CompressResponse, ScoredChunk, ScoredSentence } from "@/lib/types";

interface FlatSentence {
  chunkIndex: number;
  sentenceIndex: number;
  text: string;
}

export async function POST(req: NextRequest) {
  let body: { query?: unknown; chunks?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query : "";
  const chunks = Array.isArray(body.chunks)
    ? body.chunks.filter((c): c is string => typeof c === "string")
    : [];

  if (!query.trim()) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }
  if (chunks.length === 0) {
    return NextResponse.json({ error: "At least one chunk is required." }, { status: 400 });
  }

  // Flatten every chunk's sentences into one corpus so BM25's IDF term is
  // computed across the whole retrieved set before scoring each sentence.
  const flat: FlatSentence[] = [];
  chunks.forEach((chunkText, chunkIndex) => {
    splitSentences(chunkText).forEach((text, sentenceIndex) => {
      flat.push({ chunkIndex, sentenceIndex, text });
    });
  });

  const rawScores = scoreBM25(query, flat);
  const normalized = normalizeScores(rawScores);

  const scoredFlat: ScoredSentence[] = flat.map((s, i) => ({
    ...s,
    rawScore: rawScores[i],
    normalizedScore: normalized[i],
    tokenCount: countTextTokens(s.text),
  }));

  const resultChunks: ScoredChunk[] = chunks.map((_, chunkIndex) => {
    const sentences = scoredFlat.filter((s) => s.chunkIndex === chunkIndex);
    return {
      chunkIndex,
      sentences,
      originalTokens: sentences.reduce((sum, s) => sum + s.tokenCount, 0),
    };
  });

  const response: CompressResponse = { query, chunks: resultChunks };
  return NextResponse.json(response);
}
