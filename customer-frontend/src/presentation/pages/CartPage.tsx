import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/business-logic/hooks/useCart';
import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';
import CartItem from '../features/CartItem';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatPrice } from '@/utility/formatters';

export default function CartPage() {
  const { items, totalPrice, isEmpty, updateQuantity, remove, clear } =
    useCart();
  const { createOrder, loading } = useCustomerApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    try {
      setError('');
      await createOrder();
      setIsModalOpen(false);
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || '주문에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="cart-page">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/menu')}
              className="text-primary-600 hover:text-primary-700"
            >
              ← 메뉴로 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
            <div className="w-24" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {isEmpty ? (
          <EmptyState
            message="장바구니가 비어있습니다."
            actionLabel="메뉴 보기"
            onAction={() => navigate('/menu')}
          />
        ) : (
          <>
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.menu.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={remove}
                  />
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    총 금액
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={clear}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  장바구니 비우기
                </button>
                <Button
                  label="주문하기"
                  onClick={() => setIsModalOpen(true)}
                  variant="primary"
                  data-testid="cart-page-place-order-button"
                />
              </div>
            </div>
          </>
        )}

        {/* Order Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="주문 확인"
        >
          <div className="space-y-4">
            <p className="text-gray-600">주문하시겠습니까?</p>

            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">주문 내역</p>
              <ul className="mt-2 space-y-1">
                {items.map((item) => (
                  <li
                    key={item.menu.id}
                    className="text-sm text-gray-600"
                  >
                    {item.menu.name} x{item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-lg font-bold text-gray-900">
                총 {formatPrice(totalPrice)}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                취소
              </button>
              <Button
                label={loading ? '주문 중...' : '확인'}
                onClick={handlePlaceOrder}
                variant="primary"
                disabled={loading}
              />
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
