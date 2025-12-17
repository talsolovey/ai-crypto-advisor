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

  async function onUp() {
    // if already upvoted -> unvote, else vote +1
    const next = myVote === 1 ? null : 1;
    onChangeVote(next);

    try {
      if (next === null) await unvote({ section, itemId });
      else await vote({ section, itemId, value: 1 });
    } catch {
      // revert on failure
      onChangeVote(myVote);
    }
  }

  async function onDown() {
    const next = myVote === -1 ? null : -1;
    onChangeVote(next);

    try {
      if (next === null) await unvote({ section, itemId });
      else await vote({ section, itemId, value: -1 });
    } catch {
      onChangeVote(myVote);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button type="button" onClick={onUp} pressed={myVote === 1}>
        👍 {myVote === 1 ? "Upvoted" : "Upvote"}
      </Button>
      <Button type="button" onClick={onDown} pressed={myVote === -1}>
        👎 {myVote === -1 ? "Downvoted" : "Downvote"}
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth(); // from your AuthProvider
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

  function setItemVote(section: SectionKey, itemId: string, next: 1 | -1 | null) {
    setData((prev) => {
      if (!prev) return prev;

      const s = prev.sections;

      if (section === "NEWS") {
        return {
          ...prev,
          sections: {
            ...s,
            news: s.news.map((x) => (x.itemId === itemId ? { ...x, myVote: next } : x)),
          },
        };
      }

      if (section === "PRICES") {
        return {
          ...prev,
          sections: {
            ...s,
            prices: s.prices.map((x) => (x.itemId === itemId ? { ...x, myVote: next } : x)),
          },
        };
      }

      if (section === "INSIGHT") {
        return {
          ...prev,
          sections: {
            ...s,
            insight: s.insight && s.insight.itemId === itemId ? { ...s.insight, myVote: next } : s.insight,
          },
        };
      }

      // MEME
      return {
        ...prev,
        sections: {
          ...s,
          meme: s.meme && s.meme.itemId === itemId ? { ...s.meme, myVote: next } : s.meme,
        },
      };
    });
  }

  async function onLogout() {
    // clear token + update auth state
    apiLogout();
    logout();
  }

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <div style={{ color: "crimson" }}>{error}</div>
        <button onClick={load} style={{ marginTop: 12 }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
    <div style={{ maxWidth: 900, margin: "32px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Daily Dashboard</h1>
        <Button onClick={onLogout} variant="primary">Logout</Button>
      </header>

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {/* 1) Market News */}
        <Card title="Market News">
          {news.length === 0 ? (
            <div>— No news items.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {news.map((n) => (
                <div key={n.itemId} style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                  <a href={n.url} target="_blank" rel="noreferrer">
                    {n.title}
                  </a>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    {n.source ?? "Unknown source"} • {new Date(n.publishedAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <VoteButtons
                      section="NEWS"
                      itemId={n.itemId}
                      myVote={n.myVote}
                      onChangeVote={(next) => setItemVote("NEWS", n.itemId, next)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 2) Coin Prices */}
        <Card title="Coin Prices">
          {prices.length === 0 ? (
            <div>— No prices.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {prices.map((p) => (
                <div
                  key={p.itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #eee",
                    paddingTop: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.coinId}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{formatUsd(p.usd)}</div>
                  </div>

                  <VoteButtons
                    section="PRICES"
                    itemId={p.itemId}
                    myVote={p.myVote}
                    onChangeVote={(next) => setItemVote("PRICES", p.itemId, next)}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 3) AI Insight */}
        <Card title="AI Insight of the Day">
          {!insight ? (
            <div>— No insight today.</div>
          ) : (
            <>
              <p style={{ whiteSpace: "pre-wrap" }}>{insight.text}</p>
              <VoteButtons
                section="INSIGHT"
                itemId={insight.itemId}
                myVote={insight.myVote}
                onChangeVote={(next) => setItemVote("INSIGHT", insight.itemId, next)}
              />
            </>
          )}
        </Card>

        {/* 4) Meme */}
        <Card title="Fun Crypto Meme">
          {!meme ? (
            <div>— No meme today.</div>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 10 }}></div>
              <img
                src={meme.imageUrl}
                alt={meme.title}
                style={{ maxWidth: "100%", borderRadius: 10 }}
              />
              <div style={{ marginTop: 10 }}>
                <VoteButtons
                  section="MEME"
                  itemId={meme.itemId}
                  myVote={meme.myVote}
                  onChangeVote={(next) => setItemVote("MEME", meme.itemId, next)}
                />
              </div>
            </>
          )}
        </Card>

        <Button onClick={load} style={{ padding: 10 }}>
          Refresh dashboard
        </Button>
      </div>
    </div>
    </div>
  );
}
