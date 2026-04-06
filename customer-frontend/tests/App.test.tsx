import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '@/App';

// Mock Router
vi.mock('@/infrastructure/Router', () => ({
  default: () => <div>Router Component</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('Router Component')).toBeInTheDocument();
  });
});
