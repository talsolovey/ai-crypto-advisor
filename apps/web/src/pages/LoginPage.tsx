import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";
import Card from "../components/Card";
import Button from "../components/Button";

export default function LoginPage() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      await refreshMe();
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authShell">
      <div className="card heroCard">
        <div className="brand" style={{ marginBottom: 14 }}>
          <div>
            <div>AI Crypto Advisor</div>
          </div>
        </div>

        <h1 className="heroTitle">Welcome back</h1>
        <p className="heroLead">
          Clean dashboard. Tailored news. Daily AI insight. Vote to teach the feed what matters to you.
        </p>
      </div>

      <Card title="Log in">
        <form onSubmit={onSubmit} className="formGrid">
          <label className="formLabel">
            <strong>Email</strong>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          <label className="formLabel">
            <strong>Password</strong>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <Button disabled={loading} type="submit" variant="primary">
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="muted" style={{ marginTop: 4 }}>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
