import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAutoLogin } from '@/business-logic/hooks/useAutoLogin';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('../context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(() => ({
    login: vi.fn(),
    session: { isAuthenticated: false },
  })),
}));

vi.mock('@/data-access/localStorageManager', () => ({
  loadCustomerAuth: vi.fn(() => null),
}));

vi.mock('@/infrastructure/Logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAutoLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not attempt auto-login when already authenticated', () => {
    const { useCustomerApp } = require('../context/CustomerAppContext');
    vi.mocked(useCustomerApp).mockReturnValue({
      login: vi.fn(),
      session: { isAuthenticated: true },
    });

    renderHook(() => useAutoLogin());

    const { login } = useCustomerApp();
    expect(login).not.toHaveBeenCalled();
  });

  it('should not attempt auto-login when no saved credentials', () => {
    const { loadCustomerAuth } = require('@/data-access/localStorageManager');
    vi.mocked(loadCustomerAuth).mockReturnValue(null);

    renderHook(() => useAutoLogin());

    const { useCustomerApp } = require('../context/CustomerAppContext');
    const { login } = useCustomerApp();
    expect(login).not.toHaveBeenCalled();
  });

  it('should attempt auto-login with saved credentials', async () => {
    const { loadCustomerAuth } = require('@/data-access/localStorageManager');
    vi.mocked(loadCustomerAuth).mockReturnValue({
      tableNumber: 1,
      password: 'test123',
      storeId: 1,
    });

    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const mockNavigate = vi.fn();

    const { useCustomerApp } = require('../context/CustomerAppContext');
    vi.mocked(useCustomerApp).mockReturnValue({
      login: mockLogin,
      session: { isAuthenticated: false },
    });

    const { useNavigate } = require('react-router-dom');
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    renderHook(() => useAutoLogin());

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(1, 'test123');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/menu', { replace: true });
    });
  });
});
