import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerApp } from '../context/CustomerAppContext';
import { loadCustomerAuth } from '@/data-access/localStorageManager';
import Logger from '@/infrastructure/Logger';

/**
 * Auto-login hook
 * Checks LocalStorage for saved credentials on mount
 * Auto-login if credentials exist
 * Redirect to /menu on success, /login on failure
 *
 * Usage: Call this in LoginPage component
 */
export function useAutoLogin() {
  const { login, session } = useCustomerApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip if already authenticated
    if (session.isAuthenticated) {
      Logger.info('useAutoLogin: Already authenticated, skipping');
      return;
    }

    const attemptAutoLogin = async () => {
      const savedAuth = loadCustomerAuth();

      if (!savedAuth) {
        Logger.info('useAutoLogin: No saved credentials found');
        return;
      }

      try {
        Logger.info('useAutoLogin: Attempting auto-login', {
          tableNumber: savedAuth.tableNumber,
        });

        await login(savedAuth.tableNumber, savedAuth.password);

        Logger.info('useAutoLogin: Auto-login successful, redirecting to /menu');
        navigate('/menu', { replace: true });
      } catch (error) {
        Logger.error('useAutoLogin: Auto-login failed', error);
        // Don't clear saved credentials here - let user try manually
        // They will be cleared on manual login attempt
      }
    };

    attemptAutoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount
}
