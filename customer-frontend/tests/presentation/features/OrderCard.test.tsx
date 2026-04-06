import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderCard from '@/presentation/features/OrderCard';
import { Order, OrderItem, Menu } from '@/data-access/types';

const mockMenu: Menu = {
  id: 1,
  store_id: 1,
  category_id: 1,
  name: 'Test Menu',
  description: 'Test',
  price: 10000,
  is_available: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockOrderItem: OrderItem = {
  id: 1,
  order_id: 1,
  menu_id: 1,
  quantity: 2,
  price: 10000,
  menu: mockMenu,
};

const mockOrder: Order = {
  id: 1,
  store_id: 1,
  table_id: 1,
  order_number: 123,
  status: 'pending',
  created_at: '2024-01-01T12:00:00Z',
  items: [mockOrderItem],
};

describe('OrderCard', () => {
  it('should render order information', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('Test Menu')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.getByText('₩20,000')).toBeInTheDocument(); // Total
  });

  it('should render order status', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText('대기 중')).toBeInTheDocument();
  });

  it('should calculate total price correctly', () => {
    const orderWithMultipleItems: Order = {
      ...mockOrder,
      items: [
        mockOrderItem,
        { ...mockOrderItem, id: 2, quantity: 1, price: 5000 },
      ],
    };

    render(<OrderCard order={orderWithMultipleItems} />);
    expect(screen.getByText('₩25,000')).toBeInTheDocument();
  });
});
