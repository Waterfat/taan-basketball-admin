import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';

export default function Login() {
  const token = useAuthStore((s) => s.accessToken);
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">大安聯盟後台</h1>
          <p className="text-sm text-gray-500 mt-1">管理員登入</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <FormField
            label="帳號"
            required
            value={username}
            onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
            placeholder="admin"
            autoFocus
          />
          <FormField
            label="密碼"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            placeholder="••••••••"
          />
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
