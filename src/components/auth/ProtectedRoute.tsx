
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to auth page
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // If no specific roles are required, or the user has admin role, allow access
  if (!allowedRoles || profile.role === 'admin') {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = allowedRoles.includes(profile.role);
  if (!hasRequiredRole) {
    return <Navigate to="/platform" replace />;
  }

  return <>{children}</>;
};
