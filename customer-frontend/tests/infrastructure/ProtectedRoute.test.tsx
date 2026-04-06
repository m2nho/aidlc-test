import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/infrastructure/ProtectedRoute';

// Mock useCustomerApp hook
vi.mock('@/business-logic/context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(),
}));

import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    vi.mocked(useCustomerApp).mockReturnValue({
      session: { isAuthenticated: true, tableNumber: 1, storeId: 1 },
    } as any);

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to /login when not authenticated', () => {
    vi.mocked(useCustomerApp).mockReturnValue({
      session: { isAuthenticated: false, tableNumber: null, storeId: null },
    } as any);

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
