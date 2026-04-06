import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Router from '@/infrastructure/Router';

// Mock child components
vi.mock('@/presentation/pages/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}));
vi.mock('@/presentation/pages/MenuPage', () => ({
  default: () => <div>Menu Page</div>,
}));
vi.mock('@/presentation/pages/CartPage', () => ({
  default: () => <div>Cart Page</div>,
}));
vi.mock('@/presentation/pages/OrderHistoryPage', () => ({
  default: () => <div>Order History Page</div>,
}));
vi.mock('@/presentation/common/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));
vi.mock('@/infrastructure/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Router', () => {
  it('should render without crashing', () => {
    render(<Router />);
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('should redirect to /login on root path', () => {
    window.history.pushState({}, '', '/');
    render(<Router />);
    expect(window.location.pathname).toBe('/');
  });
});
