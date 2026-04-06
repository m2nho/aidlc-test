import { CartItem as CartItemType } from '@/data-access/types';
import { formatPrice, formatQuantity } from '@/utility/formatters';
import Button from '../common/Button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (menuId: number, quantity: number) => void;
  onRemove: (menuId: number) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const subtotal = item.menu.price * item.quantity;

  const handleIncrement = () => {
    if (item.quantity < 99) {
      onUpdateQuantity(item.menu.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.menu.id, item.quantity - 1);
    }
  };

  return (
    <div
      className="flex items-center justify-between border-b border-gray-200 py-4"
      data-testid={`cart-item-${item.menu.id}`}
    >
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.menu.name}</h4>
        <p className="text-sm text-gray-600">{formatPrice(item.menu.price)}</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid={`decrement-${item.menu.id}`}
          >
            -
          </button>
          <span
            className="w-12 text-center font-medium"
            data-testid={`quantity-${item.menu.id}`}
          >
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={item.quantity >= 99}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid={`increment-${item.menu.id}`}
          >
            +
          </button>
        </div>

        <p className="w-24 text-right font-bold text-gray-900">
          {formatPrice(subtotal)}
        </p>

        <button
          onClick={() => onRemove(item.menu.id)}
          className="text-red-600 hover:text-red-700"
          data-testid={`remove-${item.menu.id}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
