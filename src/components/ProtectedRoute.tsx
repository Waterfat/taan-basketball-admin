import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ROLE_LEVEL, type Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole = 'VIEWER' }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (ROLE_LEVEL[user.role] < ROLE_LEVEL[requiredRole]) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">權限不足，無法存取此頁面</p>
      </div>
    );
  }

  return <>{children}</>;
}
