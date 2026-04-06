import { useEffect } from 'react';
import { useAdminApp } from '../contexts/AdminAppContext';
import { useSSE } from '../hooks/useSSE';
import { api } from '../services/apiClient';
import { OrdersResponse, TablesResponse } from '../services/types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

function DashboardPage() {
  const { state, dispatch } = useAdminApp();

  // Connect to SSE for real-time updates
  useSSE({ url: '/api/admin/orders/stream', maxReconnectAttempts: 5 });

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch orders
        dispatch({ type: 'ORDERS_FETCH_START' });
        const ordersResponse = await api.get<OrdersResponse>('/api/admin/orders');
        dispatch({
          type: 'ORDERS_FETCH_SUCCESS',
          payload: { orders: ordersResponse.orders },
        });

        // Fetch tables
        dispatch({ type: 'TABLES_FETCH_START' });
        const tablesResponse = await api.get<TablesResponse>('/api/admin/tables');
        dispatch({
          type: 'TABLES_FETCH_SUCCESS',
          payload: { tables: tablesResponse.tables },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }

    fetchData();
  }, [dispatch]);

  if (state.loading.orders || state.loading.tables) {
    return <LoadingSpinner fullScreen message="데이터를 불러오는 중..." />;
  }

  // Group orders by table
  const tableOrdersMap = new Map<string, typeof state.orders>();
  state.orders.forEach((order) => {
    const existing = tableOrdersMap.get(order.tableId) || [];
    tableOrdersMap.set(order.tableId, [...existing, order]);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">주문 대시보드</h1>
          <p className="mt-2 text-gray-600">
            실시간 주문 현황 (SSE: {state.sse.isConnected ? '연결됨' : '연결 끊김'})
          </p>
        </div>

        {state.tables.length === 0 ? (
          <EmptyState message="등록된 테이블이 없습니다" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.tables.map((table) => {
              const tableOrders = tableOrdersMap.get(table.id) || [];
              const totalAmount = tableOrders.reduce(
                (sum, order) => sum + order.totalAmount,
                0
              );

              return (
                <div
                  key={table.id}
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`table-card-${table.tableNumber}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        테이블 {table.tableNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        주문 {tableOrders.length}건
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">
                        {totalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {tableOrders.length > 0 && (
                    <div className="space-y-2">
                      {tableOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="p-2 bg-gray-50 rounded text-sm"
                        >
                          <div className="flex justify-between">
                            <span>{order.items[0]?.menuName || '주문'}</span>
                            <span className="text-gray-600">{order.status}</span>
                          </div>
                        </div>
                      ))}
                      {tableOrders.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          외 {tableOrders.length - 3}건
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
