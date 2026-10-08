import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <Spinner size="lg" className="text-brand-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/store" replace />;
  }

  return <>{children}</>;
}
