import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";

export default function SignupPage() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({ name, email, password }); // saves token
      await refreshMe();                   // fetch /me
      nav("/", { replace: true });         // go to onboarding/dashboard
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 16 }}>
      <h1>Sign up</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </button>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
