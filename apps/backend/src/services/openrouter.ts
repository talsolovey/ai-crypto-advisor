type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function getBaseUrl() {
  return "https://openrouter.ai/api/v1";
}

function normalizeInsight(raw: string): string {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines.filter((l) => l.startsWith("- ")).slice(0, 4);
  const risk = lines.find((l) => l.toLowerCase().startsWith("risk:")) ?? "Risk: Crypto is volatile; use position sizing and avoid leverage if unsure.";

  // Guarantee 4 bullets
  while (bullets.length < 4) bullets.push("- Market conditions can shift quickly; watch liquidity and major news catalysts.");

  return [...bullets.slice(0, 4), risk].join("\n");
}

// Generate daily insight text using OpenRouter AI
export async function generateInsightText(params: {
  assets: string[];
  investorType: string;
  contentTypes: string[];
  date: string; // YYYY-MM-DD
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    // No key: return safe fallback
    return `No AI key configured. (Placeholder insight for ${params.investorType} on ${params.date})`;
  }

  const model = process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-r1:free";

  const assets = params.assets.slice(0, 8).join(", ") || "N/A";
  const investorType = params.investorType || "Unknown";

  const messages: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are an educational crypto market briefing assistant. " +
      "No financial advice. No buy/sell. No price predictions. No hype. " +
      "Output MUST be plain text only (no Markdown). " +
      "Keep it short, concrete, and readable."+
      "No analysis, no resoning steps, just the final insight output."
  },
  {
    role: "user",
    content:
      `Date: ${params.date}\n` +
      `Investor type: ${investorType}\n` +
      `Assets: ${assets}\n\n` +
      `Write a daily insight tailored to this profile.\n` +
      `STRICT FORMAT (exactly 5 lines):\n` +
      `1) Bullet: <max 110 chars>\n` +
      `2) Bullet: <max 110 chars>\n` +
      `3) Bullet: <max 110 chars>\n` +
      `4) Bullet: <max 110 chars>\n` +
      `5) Risk: <max 140 chars>\n\n` +
      `Rules:\n` +
      `- Start each bullet with "- "\n` +
      `- Start risk line with "Risk: "\n` +
      `- Mention at least 2 of the listed assets by name.\n` +
      `- No headings. No intro sentence. No blank lines.`,
  },
];

  const res = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(process.env.OPENROUTER_SITE_URL
        ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
        : {}),
      ...(process.env.OPENROUTER_APP_NAME ? { "X-Title": process.env.OPENROUTER_APP_NAME } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as any;

  if (!json?.choices?.length) {
    throw new Error("OpenRouter returned no choices");
  }

  const text = json?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter returned empty insight");
  }

  return normalizeInsight(text);
}
