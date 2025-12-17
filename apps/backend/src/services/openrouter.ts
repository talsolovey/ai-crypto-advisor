type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function getBaseUrl() {
  return "https://openrouter.ai/api/v1";
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
        "You are an AI crypto advisor. Be cautious: no financial advice. Provide general educational insight only. " +
        "Be concise (3-5 bullets). Mention risks. No price predictions.",
    },
    {
      role: "user",
      content:
        `Date: ${params.date}\n` +
        `Investor type: ${investorType}\n` +
        `Assets: ${assets}\n\n` +
        `Write a short daily insight tailored to this profile. ` +
        `Format: 3-5 bullet points. Include 1 risk warning. Avoid hype. No “buy/sell”.`,
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
      max_tokens: 220,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as any;
  const text = json?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter returned empty insight");
  }

  return text.trim();
}
