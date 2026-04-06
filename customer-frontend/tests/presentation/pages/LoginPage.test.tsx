import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/presentation/pages/LoginPage';

// Mock dependencies
vi.mock('@/business-logic/context/CustomerAppContext', () => ({
  useCustomerApp: vi.fn(() => ({
    login: vi.fn(),
    loading: false,
  })),
}));

vi.mock('@/business-logic/hooks/useAutoLogin', () => ({
  useAutoLogin: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe('LoginPage', () => {
  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('테이블 오더')).toBeInTheDocument();
    expect(screen.getByLabelText('테이블 번호')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });
});
