import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApp } from '../contexts/AdminAppContext';
import { api } from '../services/apiClient';
import { LoginResponse, LoginCredentials } from '../services/types';
import { getErrorMessage } from '../services/apiError';

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const { state, dispatch } = useAdminApp();
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch({ type: 'AUTH_LOGIN_START' });

        const response = await api.post<LoginResponse>('/api/admin/login', {
          storeId: credentials.storeId,
          username: credentials.username,
          password: credentials.password,
        });

        dispatch({
          type: 'AUTH_LOGIN_SUCCESS',
          payload: {
            admin: response.admin,
            token: response.token,
          },
        });

        // Navigate to dashboard after successful login
        navigate('/dashboard');

        return { success: true };
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        dispatch({
          type: 'AUTH_LOGIN_FAILURE',
          payload: { error: errorMessage },
        });
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(() => {
    dispatch({ type: 'AUTH_LOGOUT' });
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('adminData');
    navigate('/login');
  }, [dispatch, navigate]);

  return {
    isAuthenticated: state.auth.isAuthenticated,
    admin: state.auth.admin,
    loading: state.auth.loading,
    error: state.auth.error,
    login,
    logout,
  };
}
