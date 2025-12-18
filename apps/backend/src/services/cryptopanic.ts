export type NewsItem = {
  itemId: string;
  title: string;
  publishedAt: string;
  snippet?: string;
};

const baseUrl = "https://cryptopanic.com/api/developer/v2/posts/";

const COINGECKO_TO_SYMBOL: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  cardano: "ADA",
  polkadot: "DOT",
  litecoin: "LTC",
  chainlink: "LINK",
  avalanche: "AVAX",
  tron: "TRX",
  toncoin: "TON",
};

// Converts CoinGecko coin IDs to CryptoPanic currency symbols
function toSymbols(coinIds: string[]): string[] {
  const out: string[] = [];
  for (const id of coinIds) {
    const sym = COINGECKO_TO_SYMBOL[id.trim().toLowerCase()];
    if (sym) out.push(sym);
  }
  return Array.from(new Set(out)).slice(0, 50); // limit to 50 unique
}

// Fetches news items from CryptoPanic for given coin IDs
export async function fetchNews(coinIds: string[], limit = 10): Promise<NewsItem[]> {
  const token = process.env.CRYPTOPANIC_TOKEN?.trim();
  if (!token) return [];

  const symbols = toSymbols(coinIds);

  const url = new URL(baseUrl);
  url.searchParams.set("auth_token", token);

  if (symbols.length > 0) {
    url.searchParams.set("currencies", symbols.join(","));
  }

  url.searchParams.set("public", "true");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`CryptoPanic error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as any;
  const results = Array.isArray(json?.results) ? json.results : [];

  return results.slice(0, limit).map((p: any) => ({
    itemId: `news:${String(p.id ?? p.slug ?? Math.random())}`,
    title: String(p.title ?? "Untitled"),
    publishedAt: String(p.published_at ?? p.created_at ?? new Date().toISOString()),
    snippet: p?.description,
    }));
}