import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartItem from '@/presentation/features/CartItem';
import { CartItem as CartItemType, Menu } from '@/data-access/types';

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

const mockCartItem: CartItemType = {
  menu: mockMenu,
  quantity: 2,
};

describe('CartItem', () => {
  it('should render cart item information', () => {
    render(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Test Menu')).toBeInTheDocument();
    expect(screen.getByText('₩10,000')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-1')).toHaveTextContent('2');
    expect(screen.getByText('₩20,000')).toBeInTheDocument(); // Subtotal
  });

  it('should call onUpdateQuantity when increment button is clicked', () => {
    const handleUpdateQuantity = vi.fn();
    render(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('increment-1'));
    expect(handleUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('should call onUpdateQuantity when decrement button is clicked', () => {
    const handleUpdateQuantity = vi.fn();
    render(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('decrement-1'));
    expect(handleUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('should disable decrement button when quantity is 1', () => {
    const item = { ...mockCartItem, quantity: 1 };
    render(<CartItem item={item} onUpdateQuantity={() => {}} onRemove={() => {}} />);

    const decrementButton = screen.getByTestId('decrement-1');
    expect(decrementButton).toBeDisabled();
  });

  it('should call onRemove when remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={() => {}}
        onRemove={handleRemove}
      />
    );

    fireEvent.click(screen.getByTestId('remove-1'));
    expect(handleRemove).toHaveBeenCalledWith(1);
  });
});
