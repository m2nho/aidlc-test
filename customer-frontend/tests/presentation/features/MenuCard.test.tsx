import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuCard from '@/presentation/features/MenuCard';
import { Menu } from '@/data-access/types';

const mockMenu: Menu = {
  id: 1,
  store_id: 1,
  category_id: 1,
  name: 'Test Menu',
  description: 'Delicious test menu',
  price: 10000,
  is_available: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('MenuCard', () => {
  it('should render menu information', () => {
    render(<MenuCard menu={mockMenu} onAddToCart={() => {}} />);

    expect(screen.getByText('Test Menu')).toBeInTheDocument();
    expect(screen.getByText('Delicious test menu')).toBeInTheDocument();
    expect(screen.getByText('₩10,000')).toBeInTheDocument();
  });

  it('should call onAddToCart when add button is clicked', () => {
    const handleAddToCart = vi.fn();
    render(<MenuCard menu={mockMenu} onAddToCart={handleAddToCart} />);

    fireEvent.click(screen.getByRole('button', { name: '담기' }));
    expect(handleAddToCart).toHaveBeenCalledWith(mockMenu);
  });

  it('should disable button when menu is not available', () => {
    const unavailableMenu = { ...mockMenu, is_available: false };
    render(<MenuCard menu={unavailableMenu} onAddToCart={() => {}} />);

    const button = screen.getByRole('button', { name: '담기' });
    expect(button).toBeDisabled();
    expect(screen.getByText('품절')).toBeInTheDocument();
  });
});
