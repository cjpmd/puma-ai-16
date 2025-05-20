
// This file is being replaced by useAuth.tsx to solve the TypeScript role issues
import { useAuth as useAuthFromTsx } from './useAuth.tsx';
import { AuthContext } from './useAuth.tsx';

// Re-export the useAuth hook from useAuth.tsx
export const useAuth = useAuthFromTsx;

// Re-export the AuthContext
export { AuthContext };
