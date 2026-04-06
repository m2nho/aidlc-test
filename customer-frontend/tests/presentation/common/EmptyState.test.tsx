import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '@/presentation/common/EmptyState';

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(
      <EmptyState
        message="No items"
        icon={<span data-testid="icon">📦</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        message="No items"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalled();
  });

  it('should not render action button when not provided', () => {
    render(<EmptyState message="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
