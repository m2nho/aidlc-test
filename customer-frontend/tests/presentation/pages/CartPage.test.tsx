import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CartPage from '@/presentation/pages/CartPage';

// Mock dependencies
vi.mock('@/business-logic/hooks/useCart', () => ({
  useCart: vi.fn(() => ({
    items: [],
    totalPrice: 0,
    isEmpty: true,
    updateQuantity: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('@/business-logic/context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(() => ({
    createOrder: vi.fn(),
    loading: false,
  })),
}));

describe('CartPage', () => {
  it('should render cart page', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    );

    expect(screen.getByText('장바구니')).toBeInTheDocument();
  });

  it('should show empty state when cart is empty', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    );

    expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();
  });
});
