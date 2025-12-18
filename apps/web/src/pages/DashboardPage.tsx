import { useEffect, useMemo, useState } from "react";
import { getDashboard, vote, unvote, logout as apiLogout } from "../api/endpoints";
import type { DashboardResponse } from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import Card from "../components/Card";
import Button from "../components/Button";

type SectionKey = "NEWS" | "PRICES" | "INSIGHT" | "MEME";

function formatUsd(n: number | null) {
  if (n == null) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function VoteButtons(props: {
  section: SectionKey;
  itemId: string;
  myVote: 1 | -1 | null;
  onChangeVote: (next: 1 | -1 | null) => void;
}) {
  const { section, itemId, myVote, onChangeVote } = props;

  async function onVote(next: 1 | -1 | null) {
    onChangeVote(next);
    try {
      if (next === null) await unvote({ section, itemId });
      else await vote({ section, itemId, value: next });
    } catch {
      onChangeVote(myVote);
    }
  }

  return (
    <div className="voteGroup">
      <Button
        type="button"
        className="voteBtn"
        pressed={myVote === 1}
        onClick={() => onVote(myVote === 1 ? null : 1)}
      >
        👍
      </Button>
      <Button
        type="button"
        className="voteBtn"
        pressed={myVote === -1}
        onClick={() => onVote(myVote === -1 ? null : -1)}
      >
        👎
      </Button>
    </div>
  );
}

function InsightBlock({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
  const riskLine = lines.find((l) => l.toLowerCase().startsWith("risk:"));
  const risk = riskLine ? riskLine.slice(5).trim() : null;

  return (
    <div className="insightBox">
      <ul className="insightList">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      {risk && (
        <div className="insightRisk">
          <span className="insightRiskLabel">Risk</span>
          <span>{risk}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load dashboard";
      if (msg.toLowerCase().includes("onboarding")) {
        logout();
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const news = useMemo(() => data?.sections.news ?? [], [data]);
  const prices = useMemo(() => data?.sections.prices ?? [], [data]);
  const insight = data?.sections.insight ?? null;
  const meme = data?.sections.meme ?? null;

  const enabled = useMemo(() => {
    const set = new Set<string>();
    if (news.length > 0) set.add("news");
    if (prices.length > 0) set.add("prices");
    if (insight) set.add("insight");
    if (meme) set.add("meme");
    return set;
  }, [news, prices, insight, meme]);


  function setItemVote(section: SectionKey, itemId: string, next: 1 | -1 | null) {
    setData((prev) => {
      if (!prev) return prev;
      const s = prev.sections;

      if (section === "NEWS") {
        return { ...prev, sections: { ...s, news: s.news.map((x) => (x.itemId === itemId ? { ...x, myVote: next } : x)) } };
      }
      if (section === "PRICES") {
        return { ...prev, sections: { ...s, prices: s.prices.map((x) => (x.itemId === itemId ? { ...x, myVote: next } : x)) } };
      }
      if (section === "INSIGHT") {
        return { ...prev, sections: { ...s, insight: s.insight && s.insight.itemId === itemId ? { ...s.insight, myVote: next } : s.insight } };
      }
      return { ...prev, sections: { ...s, meme: s.meme && s.meme.itemId === itemId ? { ...s.meme, myVote: next } : s.meme } };
    });
  }

  async function onLogout() {
    apiLogout();
    logout();
  }

  if (loading) return <div className="container">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="cardHeader">
            <div>
              <h1 className="cardTitle" style={{ fontSize: 22 }}>Dashboard</h1>
              <div className="cardSubtitle">Your daily crypto briefing</div>
            </div>
            <Button onClick={load} variant="primary">Retry</Button>
          </div>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const userName = "Trader";

  return (
    <div className="page">
      <div className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <div>
              <div className="headerTitle">AI Crypto Advisor</div>
              <div className="headerSubtitle">Personalized crypto brief • news, prices, AI insight</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="pill">👋 {userName}</span>
            <Button onClick={load}>Refresh</Button>
            <Button onClick={onLogout} variant="primary">Logout</Button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid2">
          {/* Left: News */}
          <div className="vstack">
            {enabled.has("news") && (
            <Card title="Market News" className="card-strong">
              <div className="cardSubtitle" style={{ marginBottom: 10 }}>
                Headlines tailored to your preferences
              </div>

              {news.length === 0 ? (
                <div className="muted">— No news items.</div>
              ) : (
                <div className="list">
                  {news.map((n) => {
                    return (
                      <div key={n.itemId} className="newsItem">
                        <div className="newsMain">
                          <div className="newsTitleRow">
                            <div className="newsTitle">{n.title}</div>
                          </div>

                          {n.snippet && <div className="newsSnippet">{n.snippet}</div>}

                          <div className="newsMeta">
                            <a href="https://cryptopanic.com" target="_blank" rel="noreferrer">
                              CryptoPanic
                            </a>
                            {" • "}
                            {new Date(n.publishedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="newsActions">
                          <VoteButtons
                            section="NEWS"
                            itemId={n.itemId}
                            myVote={n.myVote}
                            onChangeVote={(next) => setItemVote("NEWS", n.itemId, next)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            )}
          </div>

          {/* Right: stacked */}
          <div className="vstack stickyCol">
            {enabled.has("prices") && (
            <Card title="Coin Prices" className="card-strong">
              <div className="cardSubtitle" style={{ marginBottom: 10 }}>
                Quick snapshot (USD)
              </div>

              {prices.length === 0 ? (
                <div className="muted">— No prices.</div>
              ) : (
                <div className="list">
                  {prices.map((p) => (
                    <div key={p.itemId} className="listItem">
                      <div className="hstack" style={{ alignItems: "flex-start" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>{p.coinId}</div>
                          <div className="muted">{formatUsd(p.usd)}</div>
                        </div>
                        <VoteButtons
                          section="PRICES"
                          itemId={p.itemId}
                          myVote={p.myVote}
                          onChangeVote={(next) => setItemVote("PRICES", p.itemId, next)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            )}

            {enabled.has("insight") && (
            <Card title="Daily Insight" className="card-strong">
              <div className="cardSubtitle" style={{ marginBottom: 10 }}>
                A short, actionable daily takeaway
              </div>

              {!insight ? (
                <div className="muted">— No insight today.</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  <InsightBlock text={insight.text} />
                  <VoteButtons
                    section="INSIGHT"
                    itemId={insight.itemId}
                    myVote={insight.myVote}
                    onChangeVote={(next) => setItemVote("INSIGHT", insight.itemId, next)}
                  />
                </div>
              )}
            </Card>
            )}

            {enabled.has("meme") && (
            <Card title="Fun Meme" className="card-strong">
              <div className="cardSubtitle" style={{ marginBottom: 10 }}>
                Because markets are emotional 🙂
              </div>

              {!meme ? (
                <div className="cardSubtitle">— No meme today.</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    style={{ width: "100%", borderRadius: 16, border: "1px solid rgba(15,23,42,0.10)" }}
                  />
                  <VoteButtons
                    section="MEME"
                    itemId={meme.itemId}
                    myVote={meme.myVote}
                    onChangeVote={(next) => setItemVote("MEME", meme.itemId, next)}
                  />
                </div>
              )}
            </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
