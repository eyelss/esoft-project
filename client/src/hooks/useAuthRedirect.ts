import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import routes, { authDrain } from '../pages/routes';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  preserveQuery?: boolean;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { authStatus, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Don't redirect while loading

    if (authStatus === 'authenticated') {
      const redirectPath = options.redirectTo || routes[authDrain].pathUrl;
      
      // Preserve query parameters if requested
      const search = options.preserveQuery ? location.search : '';
      const fullPath = search ? `${redirectPath}${search}` : redirectPath;
      
      navigate(fullPath, { replace: true });
    }
  }, [authStatus, loading, navigate, location.search, options.redirectTo, options.preserveQuery]);

  return { authStatus, loading };
}; 