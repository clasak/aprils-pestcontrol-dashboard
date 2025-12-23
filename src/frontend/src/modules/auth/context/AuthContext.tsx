/**
 * Auth Context - Re-export from main contexts
 * 
 * This file re-exports the Supabase-based AuthContext for backward compatibility
 * with existing imports in the auth module.
 */

export { 
  AuthProvider, 
  useAuth,
  type AuthContextType,
  type UserProfile,
  type SignUpData,
  type SignInData,
} from '../../../contexts/AuthContext';

export { default } from '../../../contexts/AuthContext';
