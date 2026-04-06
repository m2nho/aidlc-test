import { Order } from '@/data-access/types';
import {
  formatPrice,
  formatDateShort,
  formatOrderStatus,
} from '@/utility/formatters';
import { ORDER_STATUS_COLORS } from '@/utility/constants';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const totalPrice = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const statusColor = ORDER_STATUS_COLORS[order.status.toUpperCase() as keyof typeof ORDER_STATUS_COLORS] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      data-testid={`order-card-${order.id}`}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-600">
              주문 번호
            </span>
            <span className="ml-2 text-lg font-bold text-gray-900">
              #{order.order_number}
            </span>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
            {formatOrderStatus(order.status.toUpperCase())}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formatDateShort(order.created_at)}
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex-1">
                <span className="text-gray-900">
                  {item.menu?.name || `메뉴 ID ${item.menu_id}`}
                </span>
                <span className="ml-2 text-gray-500">x{item.quantity}</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="font-medium text-gray-900">총액</span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
