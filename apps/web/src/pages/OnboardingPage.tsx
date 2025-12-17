import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPreferences, saveOnboarding } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";
import type { PreferencesResponse } from "../api/types";

const ASSET_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
  { id: "solana", label: "Solana (SOL)" },
  { id: "ripple", label: "XRP (Ripple)" },
  { id: "dogecoin", label: "Dogecoin (DOGE)" },
];

const INVESTOR_TYPES = [
  "HODLer",
  "Day Trader",
  "Long-term Investor",
  "Beginner",
];

const CONTENT_TYPES = [
  { id: "news", label: "News" },
  { id: "prices", label: "Prices" },
  { id: "insight", label: "AI Insight" },
  { id: "meme", label: "Meme" },
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

  // Prefill (if backend already has preferences)
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
        // If none exist yet (or endpoint returns non-200), just start with empty defaults
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
    if (!canSubmit) return;

    setError(null);
    setSaving(true);

    try {
      await saveOnboarding({ assets, investorType, contentTypes });
      await refreshMe();              // updates onboardingCompleted in /me
      nav("/", { replace: true });    // HomeRedirect sends to /dashboard
    } catch (err: any) {
      setError(err?.message ?? "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading onboarding...</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "48px auto", padding: 16 }}>
      <h1>Onboarding</h1>
      <p style={{ marginTop: 6 }}>
        Choose your preferences so your dashboard is personalized.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 20, marginTop: 20 }}>
        {/* Assets */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>1 Favorite crypto assets</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {ASSET_OPTIONS.map((opt) => (
              <label key={opt.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={assets.includes(opt.id)}
                  onChange={() => setAssets((prev) => toggleInArray(prev, opt.id))}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {assets.length === 0 && (
            <div style={{ color: "crimson", marginTop: 8 }}>Pick at least one asset.</div>
          )}
        </section>

        {/* Investor type */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>2 Investor type</h2>
          <select
            value={investorType}
            onChange={(e) => setInvestorType(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Select one...</option>
            {INVESTOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {!investorType && (
            <div style={{ color: "crimson", marginTop: 8 }}>Choose an investor type.</div>
          )}
        </section>

        {/* Content types */}
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>3 Content types for your dashboard</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {CONTENT_TYPES.map((opt) => (
              <label key={opt.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={contentTypes.includes(opt.id)}
                  onChange={() => setContentTypes((prev) => toggleInArray(prev, opt.id))}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {contentTypes.length === 0 && (
            <div style={{ color: "crimson", marginTop: 8 }}>Pick at least one content type.</div>
          )}
        </section>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button disabled={!canSubmit || saving} type="submit" style={{ padding: 10 }}>
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}
