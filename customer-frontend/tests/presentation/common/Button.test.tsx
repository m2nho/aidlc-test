import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '@/presentation/common/Button';

describe('Button', () => {
  it('should render button with label', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click Me" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button label="Click Me" onClick={handleClick} disabled />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button label="Primary" variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<Button label="Secondary" variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<Button label="Danger" variant="danger" />);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });
});
