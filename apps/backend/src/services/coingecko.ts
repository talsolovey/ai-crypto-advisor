// Represents a price row for a coin in USD
export type PriceRow = {
  coinId: string;     // e.g. "bitcoin"
  usd: number | null; // null if missing
};

const baseUrl = process.env.COINGECKO_BASE_URL ?? "https://api.coingecko.com/api/v3";


// Fetches USD prices for given coin IDs from CoinGecko
export async function fetchPricesUSD(coinIds: string[]): Promise<PriceRow[]> {
  const ids = coinIds
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (ids.length === 0) return [];

  const url = new URL(`${baseUrl}/simple/price`);
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("vs_currencies", "usd");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`CoinGecko error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as Record<string, { usd?: number }>;

  return ids.map((coinId) => ({
    coinId,
    usd: typeof json?.[coinId]?.usd === "number" ? json[coinId].usd : null,
  }));
}
