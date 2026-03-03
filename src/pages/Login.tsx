import { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';

export default function Login() {
  const token = useAuthStore((s) => s.accessToken);
  const login = useLogin();
  const formRef = useRef<HTMLFormElement>(null);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    login.mutate({ username: fd.get('username') as string, password: fd.get('password') as string });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">大安聯盟後台</h1>
          <p className="text-sm text-gray-500 mt-1">管理員登入</p>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">帳號<span className="text-red-500 ml-0.5">*</span></label>
            <input name="username" required autoFocus autoComplete="username" placeholder="admin" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">密碼<span className="text-red-500 ml-0.5">*</span></label>
            <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors" />
          </div>
          {login.isError && (
            <p className="text-sm text-red-500">
              {login.error instanceof Error ? login.error.message : '登入失敗'}
            </p>
          )}
          <Button type="submit" loading={login.isPending} className="w-full">
            登入
          </Button>
        </form>
      </div>
    </div>
  );
}
