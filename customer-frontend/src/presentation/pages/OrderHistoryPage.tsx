import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';
import { Order } from '@/data-access/types';
import OrderCard from '../features/OrderCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export default function OrderHistoryPage() {
  const { loadOrderHistory, loading } = useCustomerApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setError('');
      const result = await loadOrderHistory();
      setOrders(result);
    } catch (err: any) {
      setError(err.message || '주문 내역을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="large" message="주문 내역 로딩 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="order-history-page">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/menu')}
              className="text-primary-600 hover:text-primary-700"
            >
              ← 메뉴로 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-gray-900">주문 내역</h1>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState
            message="주문 내역이 없습니다."
            actionLabel="메뉴 보기"
            onAction={() => navigate('/menu')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
