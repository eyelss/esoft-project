import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/authSlice';
import { verifySession } from '../features/authSlice';
import { useAppDispatch } from '../store';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector((state: any) => state.auth.loading);

  useEffect(() => {
    // Verify session on mount
    dispatch(verifySession());
  }, [dispatch]);

  const getAuthStatus = (): AuthStatus => {
    if (loading) return 'loading';
    return user ? 'authenticated' : 'unauthenticated';
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    authStatus: getAuthStatus(),
  };
}; 