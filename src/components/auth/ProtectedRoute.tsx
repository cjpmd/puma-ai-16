
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Use the UserRole type imported from useAuth for consistency
import { UserRole } from "@/hooks/useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const auth = useAuth();
  const { profile, isLoading, hasRole, activeRole } = auth;

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

  // Check for globalAdmin access path
  if (allowedRoles.includes('globalAdmin')) {
    console.log('Route requires globalAdmin role, checking if user can access');
    
    // Check for global admin access directly in the profile or active role
    if (profile.role === 'globalAdmin' || activeRole === 'globalAdmin') {
      console.log('User is globalAdmin or has active globalAdmin role, granting access');
      return <>{children}</>;
    }
  }

  // Check if user has any of the required roles
  const hasRequiredRole = allowedRoles.some(role => {
    const check = hasRole && hasRole(role);
    console.log(`Checking if user has role ${role}: ${check ? 'yes' : 'no'}`);
    return check;
  });
  
  if (!hasRequiredRole) {
    console.log(`User has role ${profile.role} but needs one of ${allowedRoles.join(', ')}, denying access`);
    // Provide a clearer message for globalAdmin route attempts
    if (allowedRoles.includes('globalAdmin')) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Alert variant="warning" className="w-full max-w-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
            <AlertDescription>
              You need globalAdmin privileges to access this page. Your current role is: {profile.role}.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Navigate to="/platform" replace />
          </div>
        </div>
      );
    }
    return <Navigate to="/platform" replace />;
  }

  console.log(`User with role ${profile.role} granted access to protected route requiring ${allowedRoles.join(', ')}`);
  return <>{children}</>;
};
