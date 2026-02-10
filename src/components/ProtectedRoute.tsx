import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <p className="font-body text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
