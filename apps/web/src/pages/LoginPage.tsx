import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";

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
      await login({ email, password });   // saves token via client.ts
      await refreshMe();              // fetch /me and update auth state
      nav("/", { replace: true });   
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 16 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div style={{ color: "crimson" }}>
            {error}
          </div>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
