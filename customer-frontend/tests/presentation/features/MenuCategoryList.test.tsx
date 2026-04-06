import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuCategoryList from '@/presentation/features/MenuCategoryList';
import { MenuCategory } from '@/data-access/types';

const mockCategories: MenuCategory[] = [
  { id: 1, store_id: 1, name: '메인 메뉴', display_order: 1 },
  { id: 2, store_id: 1, name: '사이드 메뉴', display_order: 2 },
  { id: 3, store_id: 1, name: '음료', display_order: 3 },
];

describe('MenuCategoryList', () => {
  it('should render all categories plus "전체" button', () => {
    render(
      <MenuCategoryList
        categories={mockCategories}
        selectedCategory={null}
        onSelectCategory={() => {}}
      />
    );

    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('메인 메뉴')).toBeInTheDocument();
    expect(screen.getByText('사이드 메뉴')).toBeInTheDocument();
    expect(screen.getByText('음료')).toBeInTheDocument();
  });

  it('should highlight selected category', () => {
    render(
      <MenuCategoryList
        categories={mockCategories}
        selectedCategory={1}
        onSelectCategory={() => {}}
      />
    );

    const selectedButton = screen.getByText('메인 메뉴');
    expect(selectedButton).toHaveClass('bg-primary-600');
  });

  it('should call onSelectCategory when category is clicked', () => {
    const handleSelectCategory = vi.fn();
    render(
      <MenuCategoryList
        categories={mockCategories}
        selectedCategory={null}
        onSelectCategory={handleSelectCategory}
      />
    );

    fireEvent.click(screen.getByText('메인 메뉴'));
    expect(handleSelectCategory).toHaveBeenCalledWith(1);
  });

  it('should call onSelectCategory with null when "전체" is clicked', () => {
    const handleSelectCategory = vi.fn();
    render(
      <MenuCategoryList
        categories={mockCategories}
        selectedCategory={1}
        onSelectCategory={handleSelectCategory}
      />
    );

    fireEvent.click(screen.getByText('전체'));
    expect(handleSelectCategory).toHaveBeenCalledWith(null);
  });
});
