import { FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button, Card, Input, Label } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/store";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card padding="lg" className="border-white/10">
        <h1 className="text-display text-2xl font-bold text-surface-100">Welcome back</h1>
        <p className="mt-2 text-sm text-surface-400">Sign in to continue reading and manage your library.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} fullWidth size="lg">
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-surface-500">
          No account?{" "}
          <Link to="/signup" className="font-medium text-brand-400 hover:text-brand-400">
            Create one free
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
