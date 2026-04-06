import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';
import { useAutoLogin } from '@/business-logic/hooks/useAutoLogin';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

export default function LoginPage() {
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, loading } = useCustomerApp();
  const navigate = useNavigate();

  // Auto-login check
  useAutoLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tableNum = parseInt(tableNumber, 10);
    if (isNaN(tableNum) || tableNum <= 0) {
      setError('올바른 테이블 번호를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(tableNum, password);
      navigate('/menu');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="large" message="로그인 중..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
            테이블 오더
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tableNumber"
                className="block text-sm font-medium text-gray-700"
              >
                테이블 번호
              </label>
              <input
                id="tableNumber"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="비밀번호"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              label="로그인"
              type="submit"
              variant="primary"
              disabled={loading}
              data-testid="login-form-submit-button"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
