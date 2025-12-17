import { prisma } from "../db/prisma.js";
import { fetchPricesUSD } from "../services/coingecko.js";
import { fetchNews } from "../services/cryptopanic.js";
import { generateInsightText } from "../services/openrouter.js";
import { getRandomMeme } from "../services/memes.js";

type Section = "NEWS" | "PRICES" | "INSIGHT" | "MEME";

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

// Builds a map of votes for quick lookup
function buildVoteMap(rows: Array<{ section: Section; itemId: string; value: number }>) {
  const map = new Map<string, 1 | -1>();
  for (const r of rows) {
    map.set(`${r.section}:${r.itemId}`, (r.value === 1 ? 1 : -1));
  }
  return map;
}

// Gets the user's vote for a specific item
function getMyVote(voteMap: Map<string, 1 | -1>, section: Section, itemId: string): 1 | -1 | null {
  return voteMap.get(`${section}:${itemId}`) ?? null;
}

// Controller to get dashboard data for authenticated user
export async function getDashboard(req: any, res: any) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const pref = await prisma.preference.findUnique({ where: { userId } });
  if (!pref) return res.status(400).json({ error: "Onboarding not completed" });

  const assets = safeParseJsonArray(pref.assets);
  const contentTypes = safeParseJsonArray(pref.contentTypes);

  // Coin Prices
  let prices: Array<{ itemId: string; coinId: string; usd: number | null }> = [];
  if (contentTypes.includes("prices")) {
    try{
      const rows = await fetchPricesUSD(assets);
      prices = rows.map((r) => ({
      itemId: `price:${r.coinId}`,
      coinId: r.coinId,
      usd: r.usd,
    }));
    } catch (e){
      console.error("Failed to fetch prices:", e);
    }
  }

  // Market News
  let news: Array<{
    itemId: string;
    title: string;
    url: string;
    source: string | null;
    publishedAt: string;
  }> = [];

  if (contentTypes.includes("news")) {
    try {
      news = await fetchNews(assets, 10);
    } catch (e){
      // fallback if API fails
      console.error("Failed to fetch news:", e);
      news = [
        {
          itemId: "news:fallback-1",
          title: "Could not load live news right now.",
          url: "https://cryptopanic.com/",
          source: "fallback",
          publishedAt: new Date().toISOString(),
        },
      ];
    }
  }

  // Daily Insight
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let insight: { itemId: string; text: string } | null = null;

  if (contentTypes.includes("insight")) {
    const cached = await prisma.dailyInsight.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { text: true },
    });

    if (cached?.text) {
      insight = {
        itemId: `insight:${today}`,
        text: cached.text,
      };
    } else {
      let text: string;
      
      try {
        // generate once per day and store
        text = await generateInsightText({
          assets,
          investorType: pref.investorType,
          contentTypes,
          date: today,
        });

      } catch (e) {
        text = `AI insight unavailable right now. (Try again later)`;
      }

      if(text != "AI insight unavailable right now. (Try again later)") {
        await prisma.dailyInsight.create({data: {userId,date: today,text,}});
      }
      
      insight = {
        itemId: `insight:${today}`,
        text,
      };
    }
  }

  const wantsMemes = contentTypes.includes("meme");

  const meme = wantsMemes ? getRandomMeme() : null;

  // Collect itemIds per section (for one efficient votes query)
  const priceItemIds = prices.map((p) => p.itemId);
  const newsItemIds = news.map((n) => n.itemId);
  const insightItemIds = insight ? [insight.itemId] : [];
  const memeItemIds = meme ? [meme.itemId] : [];

  // Only query votes for sections/items that exist
  const orClauses: any[] = [];
  if (priceItemIds.length) orClauses.push({ section: "PRICES", itemId: { in: priceItemIds } });
  if (newsItemIds.length) orClauses.push({ section: "NEWS", itemId: { in: newsItemIds } });
  if (insightItemIds.length) orClauses.push({ section: "INSIGHT", itemId: { in: insightItemIds } });
  if (memeItemIds.length) orClauses.push({ section: "MEME", itemId: { in: memeItemIds } });

  const voteRows =
    orClauses.length === 0
      ? []
      : await prisma.vote.findMany({
          where: { userId, OR: orClauses },
          select: { section: true, itemId: true, value: true },
        });

  const voteMap = buildVoteMap(voteRows as any);

  // Attach myVote to each item
  const pricesWithVotes = prices.map((p) => ({
    ...p,
    myVote: getMyVote(voteMap, "PRICES", p.itemId),
  }));

  const newsWithVotes = news.map((n) => ({
    ...n,
    myVote: getMyVote(voteMap, "NEWS", n.itemId),
  }));

  const insightWithVote = insight
    ? { ...insight, myVote: getMyVote(voteMap, "INSIGHT", insight.itemId) }
    : null;

  const memeWithVote = meme ? { ...meme, myVote: getMyVote(voteMap, "MEME", meme.itemId) } : null;

  return res.json({
    sections: {
      news: newsWithVotes,
      prices: pricesWithVotes,
      insight: insightWithVote,
      meme: memeWithVote,
    },
  });
}
