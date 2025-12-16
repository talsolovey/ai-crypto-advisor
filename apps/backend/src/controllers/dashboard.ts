import { prisma } from "../db/prisma.js";
import { fetchPricesUSD } from "../services/coingecko.js";

// Safely parses a JSON array string into a string array
function safeParseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// Controller to get dashboard data for authenticated user
export async function getDashboard(req: any, res: any) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const pref = await prisma.preference.findUnique({ where: { userId } });
  if (!pref) {
    // user hasn’t onboarded yet
    return res.status(400).json({ error: "Onboarding not completed" });
  }

  const assets = safeParseJsonArray(pref.assets);
  const contentTypes = safeParseJsonArray(pref.contentTypes);

  // Prices (real)
  let prices: Array<{ itemId: string; coinId: string; usd: number | null }> = [];
  if (contentTypes.includes("prices")) {
    const rows = await fetchPricesUSD(assets);
    prices = rows.map((r) => ({
      itemId: `price:${r.coinId}`,
      coinId: r.coinId,
      usd: r.usd,
    }));
  }

  // Placeholders for now
  const news = contentTypes.includes("news")
    ? [
        {
          itemId: "news:placeholder-1",
          title: "News section placeholder",
          url: "https://example.com",
          source: "placeholder",
          publishedAt: new Date().toISOString(),
        },
      ]
    : [];

  const insight = contentTypes.includes("ai")
    ? {
        itemId: `insight:${new Date().toISOString().slice(0, 10)}`, // daily id
        text: `Placeholder insight for ${pref.investorType}.`,
      }
    : null;

  const meme = contentTypes.includes("meme")
    ? {
        itemId: "meme:placeholder-1",
        title: "HODL mode: ON",
        imageUrl: "https://i.imgflip.com/1bij.jpg", // placeholder
      }
    : null;

  return res.json({
    sections: {
      news,
      prices,
      insight,
      meme,
    },
  });
}
