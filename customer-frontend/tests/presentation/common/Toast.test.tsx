import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '@/presentation/common/Toast';

describe('Toast', () => {
  it('should render toast with message', () => {
    render(
      <Toast message="Success!" type="success" onClose={() => {}} />
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should auto-dismiss after duration', async () => {
    const handleClose = vi.fn();
    render(
      <Toast
        message="Auto dismiss"
        type="info"
        onClose={handleClose}
        duration={100}
      />
    );

    await waitFor(() => expect(handleClose).toHaveBeenCalled(), {
      timeout: 200,
    });
  });

  it('should close when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Toast message="Click to close" type="error" onClose={handleClose} />
    );

    fireEvent.click(screen.getByLabelText('닫기'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should render with different types', () => {
    const { rerender } = render(
      <Toast message="Success" type="success" onClose={() => {}} />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-green-500');

    rerender(<Toast message="Error" type="error" onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-500');

    rerender(<Toast message="Info" type="info" onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-500');
  });
});
