import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';
import { Menu } from '@/data-access/types';
import MenuCategoryList from '../features/MenuCategoryList';
import MenuCard from '../features/MenuCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';

export default function MenuPage() {
  const { menus, categories, loadMenus, addToCart, loading, cart } =
    useCustomerApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenus().catch((err) => {
      setError(err.message || '메뉴를 불러오는데 실패했습니다.');
    });
  }, [loadMenus]);

  const filteredMenus =
    selectedCategory === null
      ? menus
      : menus.filter((menu) => menu.category_id === selectedCategory);

  const handleAddToCart = (menu: Menu) => {
    try {
      addToCart(menu, 1);
      // Show success feedback (could add toast here)
    } catch (err: any) {
      setError(err.message || '장바구니에 추가하는데 실패했습니다.');
    }
  };

  if (loading && menus.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="large" message="메뉴 로딩 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="menu-page">
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">메뉴</h1>
            <button
              onClick={() => navigate('/cart')}
              className="relative rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            >
              장바구니
              {cart.items.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cart.items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <MenuCategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {filteredMenus.length === 0 ? (
          <EmptyState message="메뉴가 없습니다." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
