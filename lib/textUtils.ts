const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "of", "to", "in", "on",
  "at", "for", "with", "and", "or", "but", "if", "then", "so", "than", "that", "this", "these",
  "those", "it", "its", "as", "by", "from", "into", "about", "between", "after", "before",
  "above", "below", "up", "down", "out", "over", "under", "again", "further", "once", "here",
  "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
  "other", "some", "such", "nor", "not", "only", "own", "same", "too", "very", "can", "will",
  "just", "should", "now", "do", "does", "did", "doing", "have", "has", "had", "having", "i",
  "you", "he", "she", "we", "they", "them", "his", "her", "their", "our", "your", "my", "me",
  "him", "us", "what", "which", "who", "whom",
]);

const ABBREVIATIONS =
  /\b(mr|mrs|ms|dr|prof|sr|jr|vs|etc|e\.g|i\.e|approx|fig|no|vol|inc|ltd|st|u\.s|u\.k)\./gi;

// Private-use-area codepoint stands in for a "protected" period so restoring
// it afterward can never collide with a real space elsewhere in the text.
const PLACEHOLDER = String.fromCharCode(0xe000);

/**
 * Splits raw text into sentences. Protects decimal numbers and common
 * abbreviations from being mistaken for sentence boundaries.
 */
export function splitSentences(text: string): string[] {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return [];

  let protectedText = cleaned.replace(/(\d)\.(\d)/g, `$1${PLACEHOLDER}$2`);
  protectedText = protectedText.replace(ABBREVIATIONS, (m) => m.replace(".", PLACEHOLDER));

  const parts = protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.split(PLACEHOLDER).join(".").trim())
    .filter(Boolean);

  return parts.length ? parts : [cleaned];
}

/** Lowercase, strip punctuation, drop stopwords — for relevance scoring only. */
export function wordTokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}
