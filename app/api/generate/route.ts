import { NextRequest, NextResponse } from "next/server";
import type { GenerateRequestBody, GenerateResponseBody } from "@/lib/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 },
    );
  }

  let body: Partial<GenerateRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = body.query?.trim();
  const compressedContext = body.compressedContext?.trim();
  if (!query || !compressedContext) {
    return NextResponse.json(
      { error: "Query and compressed context are both required." },
      { status: 400 },
    );
  }

  const messages = [
    {
      role: "system",
      content:
        "Answer the user's question using only the provided context. Be concise and direct. If the context doesn't contain the answer, say so explicitly.",
    },
    {
      role: "user",
      content: `Context:\n${compressedContext}\n\nQuestion: ${query}`,
    },
  ];

  const start = Date.now();
  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://token-diet.local",
        "X-Title": "Token-Diet",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const responseMs = Date.now() - start;

    if (upstream.status === 429) {
      return NextResponse.json(
        {
          error:
            "Rate limit hit on OpenRouter's free tier (20 requests/min, 200/day). Wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      console.error("OpenRouter error", upstream.status, errText);
      return NextResponse.json(
        { error: `OpenRouter request failed (${upstream.status}). Please try again.` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    const answer: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!answer) {
      return NextResponse.json(
        { error: "The model returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    const result: GenerateResponseBody = {
      answer,
      responseMs,
      promptTokens: data?.usage?.prompt_tokens,
      completionTokens: data?.usage?.completion_tokens,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("generate error", err);
    return NextResponse.json(
      { error: "Could not reach OpenRouter. Check your connection and try again." },
      { status: 502 },
    );
  }
}
