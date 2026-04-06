import { MenuCategory } from '@/data-access/types';

interface MenuCategoryListProps {
  categories: MenuCategory[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function MenuCategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuCategoryListProps) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex space-x-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          data-testid="category-all"
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            data-testid={`category-${category.id}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
