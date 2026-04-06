import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OrderHistoryPage from '@/presentation/pages/OrderHistoryPage';

// Mock dependencies
vi.mock('@/business-logic/context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(() => ({
    loadOrderHistory: vi.fn().mockResolvedValue([]),
    loading: false,
  })),
}));

describe('OrderHistoryPage', () => {
  it('should render order history page', () => {
    render(
      <BrowserRouter>
        <OrderHistoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText('주문 내역')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument();
  });
});
