import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPreferences, saveOnboarding } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";
import type { PreferencesResponse } from "../api/types";
import Card from "../components/Card";
import Button from "../components/Button";

const ASSET_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
  { id: "solana", label: "Solana (SOL)" },
  { id: "ripple", label: "XRP (Ripple)" },
  { id: "dogecoin", label: "Dogecoin (DOGE)" },
];

const INVESTOR_TYPES = ["HODLer", "Day Trader", "Long-term Investor", "Beginner"];

const CONTENT_TYPES = [
  { id: "news", label: "Market News" },
  { id: "prices", label: "Coin Prices" },
  { id: "insight", label: "Daily Insights" },
  { id: "meme", label: "Fun" },
];

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

export default function OnboardingPage() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string>("");
  const [contentTypes, setContentTypes] = useState<string[]>([]);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setLoading(true);

      try {
        const prefs: PreferencesResponse = await getPreferences();
        if (cancelled) return;

        setAssets(prefs.assets ?? []);
        setInvestorType(prefs.investorType ?? "");
        setContentTypes(prefs.contentTypes ?? []);
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return assets.length > 0 && investorType.trim().length > 0 && contentTypes.length > 0;
  }, [assets, investorType, contentTypes]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasSubmitted(true);
    if (!canSubmit) return;

    setError(null);
    setSaving(true);

    try {
      await saveOnboarding({ assets, investorType, contentTypes });
      await refreshMe();
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container">Loading onboarding...</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="cardHeader">
            <div className="brand">
              <div>
                <h1 className="cardTitle" style={{ fontSize: 22 }}>
                  Personalize your dashboard
                </h1>
              <div className="cardSubtitle">
                Pick what you care about — we'll tailor news, prices, and insight around it.
              </div>
            </div>
          </div>
        </div>
        </div>

        <form onSubmit={onSubmit} className="grid">
          <div className="vstack">
            <Card title="What crypto assets are you interested in?">
              <div className="muted" style={{ marginBottom: 10 }}>
                Choose at least one asset for your watchlist.
              </div>

              <div className="list">
                {ASSET_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`listItem ${assets.includes(opt.id) ? "listItemSelected" : ""}`}
                    style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={assets.includes(opt.id)}
                      onChange={() => setAssets((prev) => toggleInArray(prev, opt.id))}
                    />
                    <span style={{ fontWeight: 650 }}>{opt.label}</span>
                  </label>
                ))}
              </div>

              {hasSubmitted && assets.length === 0 && <div className="error" style={{ marginTop: 10 }}>Pick at least one asset.</div>}
            </Card>

            <Card title="What type of investor are you?">
              <div className="muted" style={{ marginBottom: 10 }}>
                Used to tune the tone of insights.
              </div>

              <select
                value={investorType}
                onChange={(e) => setInvestorType(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">Select one...</option>
                {INVESTOR_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {hasSubmitted && !investorType && <div className="error" style={{ marginTop: 10 }}>Choose an investor type.</div>}
            </Card>

            <Card title="What kind of content would you like to see?">
              <div className="muted" style={{ marginBottom: 10 }}>
                Decide what shows up on your dashboard.
              </div>

              <div className="list">
                {CONTENT_TYPES.map((opt) => (
                  <label
                    key={opt.id}
                    className={`listItem ${contentTypes.includes(opt.id) ? "listItemSelected" : ""}`}
                    style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={contentTypes.includes(opt.id)}
                      onChange={() => setContentTypes((prev) => toggleInArray(prev, opt.id))}
                    />
                    <span style={{ fontWeight: 650 }}>{opt.label}</span>
                  </label>
                ))}
              </div>

              {hasSubmitted && contentTypes.length === 0 && <div className="error" style={{ marginTop: 10 }}>Pick at least one content type.</div>}
            </Card>

            {error && <div className="error">{error}</div>}

            <div className="onboardingFooter">
              {error && <div className="error">{error}</div>}
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
