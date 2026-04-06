import { Menu } from '@/data-access/types';
import { formatPrice } from '@/utility/formatters';
import Button from '../common/Button';

interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
}

export default function MenuCard({ menu, onAddToCart }: MenuCardProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      data-testid={`menu-card-${menu.id}`}
    >
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {menu.name}
        </h3>
        {menu.description && (
          <p className="mb-3 text-sm text-gray-600">{menu.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(menu.price)}
          </span>
          <Button
            label="담기"
            onClick={() => onAddToCart(menu)}
            variant="primary"
            disabled={!menu.is_available}
            data-testid={`add-to-cart-${menu.id}`}
          />
        </div>
        {!menu.is_available && (
          <p className="mt-2 text-sm text-red-600">품절</p>
        )}
      </div>
    </div>
  );
}
