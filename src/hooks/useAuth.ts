import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../stores/auth.store';
import type { LoginResponse, User } from '../types';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      return apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(creds),
      });
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    },
  });
}

export function useLogout() {
  const { logout, getRefreshToken } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiClient('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    },
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}

export function useMe() {
  return useMutation({
    mutationFn: () => apiClient<User>('/auth/me'),
  });
}
