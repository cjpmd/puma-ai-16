
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to auth page
  if (!profile) {
    console.log('User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If no specific roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('No roles required, granting access');
    return <>{children}</>;
  }

  // Check for global admin role first (always has access)
  if (profile.role === 'globalAdmin') {
    console.log('User is globalAdmin, granting access to protected route');
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    console.log(`User has role ${profile.role} but needs one of ${allowedRoles.join(', ')}, denying access`);
    return <Navigate to="/platform" replace />;
  }

  console.log(`User with role ${profile.role} granted access to protected route requiring ${allowedRoles.join(', ')}`);
  return <>{children}</>;
};
