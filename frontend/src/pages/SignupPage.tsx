import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button, Card, Input, Label } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName || undefined);
      navigate("/store", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card padding="lg" className="border-white/10">
        <h1 className="text-display text-2xl font-bold text-surface-100">Create your account</h1>
        <p className="mt-2 text-sm text-surface-400">Start reading free previews. Upgrade anytime.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Reader"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" required>
              Email
            </Label>
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
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} fullWidth size="lg">
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-400">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
