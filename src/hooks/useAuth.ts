
// Re-export the useAuth hook from useAuth.tsx
import { useAuth as useAuthFromTsx } from './useAuth';
import { AuthContext } from './useAuth';

// Re-export the useAuth hook from useAuth.tsx
export const useAuth = useAuthFromTsx;

// Re-export the AuthContext
export { AuthContext };
