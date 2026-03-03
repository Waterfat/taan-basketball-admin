import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useLogout } from '../../hooks/useAuth';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-end gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="h-4 w-4" />
        <span>{user?.displayName}</span>
        <span className="text-xs text-gray-400">({user?.role})</span>
      </div>
      <button
        onClick={() => logout.mutate()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        登出
      </button>
    </header>
  );
}
