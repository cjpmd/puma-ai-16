
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, isLoading, hasRole, activeRole } = useAuth();

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

  // Special handling for globalAdmin - attempt to force the active role
  if (allowedRoles.includes('globalAdmin' as UserRole)) {
    console.log('Route requires globalAdmin role, checking if user can access');
    
    // Check for global admin access directly in the profile or active role
    if (profile.role === 'globalAdmin' || activeRole === 'globalAdmin') {
      console.log('User is globalAdmin or has active globalAdmin role, granting access');
      return <>{children}</>;
    }
  }

  // Check if user has any of the required roles
  const hasRequiredRole = allowedRoles.some(role => {
    const check = hasRole(role);
    console.log(`Checking if user has role ${role}: ${check ? 'yes' : 'no'}`);
    return check;
  });
  
  if (!hasRequiredRole) {
    console.log(`User has role ${profile.role} but needs one of ${allowedRoles.join(', ')}, denying access`);
    return <Navigate to="/platform" replace />;
  }

  console.log(`User with role ${profile.role} granted access to protected route requiring ${allowedRoles.join(', ')}`);
  return <>{children}</>;
};
