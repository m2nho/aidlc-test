import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/presentation/common/LoadingSpinner';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/presentation/pages/LoginPage'));
const MenuPage = lazy(() => import('@/presentation/pages/MenuPage'));
const CartPage = lazy(() => import('@/presentation/pages/CartPage'));
const OrderHistoryPage = lazy(
  () => import('@/presentation/pages/OrderHistoryPage')
);

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
