import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import routes, { authDrain, nonAuthDrain } from '../pages/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires auth, false = requires no auth
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  fallbackPath,
}) => {
  const { authStatus, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine redirect path
  const getRedirectPath = () => {
    if (fallbackPath) return fallbackPath;
    
    if (requireAuth) {
      // User needs to be authenticated but isn't
      return routes[nonAuthDrain].pathUrl;
    } else {
      // User shouldn't be authenticated but is
      return routes[authDrain].pathUrl;
    }
  };

  // Check if access should be granted
  const shouldGrantAccess = requireAuth 
    ? authStatus === 'authenticated'
    : authStatus === 'unauthenticated';

  if (!shouldGrantAccess) {
    // Redirect to appropriate page, preserving the intended destination
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
);

export const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
); 