import { Navigate } from 'react-router-dom';
import { useCustomerApp } from '@/business-logic/context/CustomerAppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useCustomerApp();

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
