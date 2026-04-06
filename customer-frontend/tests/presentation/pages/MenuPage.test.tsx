import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MenuPage from '@/presentation/pages/MenuPage';

// Mock dependencies
vi.mock('@/business-logic/context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(() => ({
    menus: [],
    categories: [],
    loadMenus: vi.fn().mockResolvedValue(undefined),
    addToCart: vi.fn(),
    loading: false,
    cart: { items: [], total: 0 },
  })),
}));

describe('MenuPage', () => {
  it('should render menu page', () => {
    render(
      <BrowserRouter>
        <MenuPage />
      </BrowserRouter>
    );

    expect(screen.getByText('메뉴')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '장바구니' })).toBeInTheDocument();
  });
});
