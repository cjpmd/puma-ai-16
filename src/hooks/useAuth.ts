
// Re-export the useAuth hook and AuthContext from useAuth.tsx
import { useAuth } from './useAuth.tsx';
import { AuthContext } from './useAuth.tsx';

// Re-export for backward compatibility
export { useAuth, AuthContext };
