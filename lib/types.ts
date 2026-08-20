export interface ScoredSentence {
  chunkIndex: number;
  sentenceIndex: number;
  text: string;
  rawScore: number;
  normalizedScore: number; // 0-1, min-max normalized across the whole retrieved set
  tokenCount: number;
}

export interface ScoredChunk {
  chunkIndex: number;
  sentences: ScoredSentence[];
  originalTokens: number;
}

export interface CompressResponse {
  query: string;
  chunks: ScoredChunk[];
}

export interface AnnotatedSentence extends ScoredSentence {
  kept: boolean;
}

export interface ChunkMetrics {
  chunkIndex: number;
  sentences: AnnotatedSentence[]; // original order, with kept/removed flag
  compressedText: string;
  originalTokens: number;
  compressedTokens: number;
}

export interface CompressionMetrics {
  perChunk: ChunkMetrics[];
  totalOriginalTokens: number;
  totalCompressedTokens: number;
  tokensSavedPct: number; // 0-100
  compressionRatio: number; // originalTokens / compressedTokens, e.g. 2.4
  estLatencyDropMs: number;
}

export interface GenerateRequestBody {
  query: string;
  compressedContext: string;
}

export interface GenerateResponseBody {
  answer: string;
  responseMs: number;
  promptTokens?: number;
  completionTokens?: number;
}
