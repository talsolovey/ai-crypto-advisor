import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/endpoints";
import { useAuth } from "../auth/AuthProvider";
import Card from "../components/Card";
import Button from "../components/Button";

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
      await signup({ name, email, password });
      await refreshMe();
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="authWrap">
          <div className="card card-strong authHeaderCard">
            <h1 className="authHeadline">Create your account</h1>
            <p className="authLead">
              Set your watchlist and content preferences once — then get a cleaner dashboard every day.
            </p>
          </div>

          <Card title="Sign up" className="card-strong">
            <form onSubmit={onSubmit} className="formGrid">
              <label className="formLabel">
                <strong>Name</strong>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your Name"
                />
              </label>

              <label className="formLabel">
                <strong>Email</strong>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
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
                  required
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </label>

              {error && <div className="error">{error}</div>}

              <Button disabled={loading} type="submit" variant="primary">
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <div className="authFooterRow muted">
                <span>Already have an account?</span>
                <Link to="/login">Log in</Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
