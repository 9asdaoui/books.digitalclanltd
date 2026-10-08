import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, User } from "lucide-react";
import { MarketingLayout } from "../components/layout/MarketingLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Badge, Button, Card, CardTitle, Spinner } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { fetchSubscriptionStatus } from "../lib/api";
import { getToken } from "../lib/auth";

function AccountContent() {
  const { user, logout, isAdmin } = useAuth();
  const [sub, setSub] = useState<{ is_subscriber: boolean; plan_id?: string; current_period_end?: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchSubscriptionStatus(token)
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MarketingLayout>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <p className="label-brand">Account</p>
            <h1 className="text-display text-3xl font-bold">Your profile</h1>
          </div>

          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-display text-xl font-semibold">{user?.full_name || "Reader"}</h2>
                <p className="text-surface-400">{user?.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="brand">{user?.role}</Badge>
                  {user?.is_subscriber && <Badge variant="subscriber">Subscriber</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4 flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-amber-400" />
              Subscription
            </CardTitle>
            {loading ? (
              <Spinner />
            ) : sub?.is_subscriber ? (
              <div>
                <p className="text-emerald-400 font-medium">Active subscription</p>
                <p className="mt-1 text-sm text-surface-400">
                  Plan: {sub.plan_id} · Renews {sub.current_period_end?.slice(0, 10)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-surface-400">You&apos;re on the free plan.</p>
                <Link to="/store" className="mt-4 inline-block">
                  <Button variant="paywall" size="sm">
                    Upgrade to unlimited
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {isAdmin && (
            <Card>
              <CardTitle className="mb-2 text-base">Publisher tools</CardTitle>
              <p className="text-sm text-surface-400 mb-4">You have administrator access.</p>
              <Link to="/admin">
                <Button variant="secondary">Open admin dashboard</Button>
              </Link>
            </Card>
          )}

          <Button variant="ghost" onClick={logout} className="text-red-400 hover:text-red-300">
            Sign out
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
