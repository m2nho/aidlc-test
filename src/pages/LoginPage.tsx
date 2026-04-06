import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../common/ToastContainer';
import Button from '../common/Button';
import {
  validateStoreId,
  validateUsername,
  validatePassword,
} from '../utils/validation';
import { LoginFormValues } from '../services/types';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation<LoginFormValues>({
    initialValues: {
      storeId: '',
      username: '',
      password: '',
    },
    validationRules: {
      storeId: validateStoreId,
      username: validateUsername,
      password: validatePassword,
    },
    onSubmit: async (formValues) => {
      const result = await login({
        storeId: formValues.storeId,
        username: formValues.username,
        password: formValues.password,
      });

      if (!result.success) {
        showToast('error', result.error || '로그인에 실패했습니다');
      } else {
        showToast('success', '로그인되었습니다');
      }
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Table Order Admin
          </h1>
          <p className="mt-2 text-gray-600">관리자 로그인</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} data-testid="login-form">
            {/* Store ID */}
            <div className="mb-4">
              <label
                htmlFor="storeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                매장 ID
              </label>
              <input
                type="text"
                id="storeId"
                className="input"
                value={values.storeId}
                onChange={(e) => handleChange('storeId', e.target.value)}
                onBlur={() => handleBlur('storeId')}
                disabled={isSubmitting}
                data-testid="login-form-storeid-input"
              />
              {touched.storeId && errors.storeId && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="login-form-storeid-error"
                >
                  {errors.storeId}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                사용자명
              </label>
              <input
                type="text"
                id="username"
                className="input"
                value={values.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                disabled={isSubmitting}
                data-testid="login-form-username-input"
              />
              {touched.username && errors.username && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="login-form-username-error"
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                className="input"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                disabled={isSubmitting}
                data-testid="login-form-password-input"
              />
              {touched.password && errors.password && (
                <p
                  className="mt-1 text-sm text-red-600"
                  data-testid="login-form-password-error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full"
              data-testid="login-form-submit-button"
            >
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
