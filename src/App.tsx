import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './stores/auth.store';
import { Spinner } from './components/ui/Spinner';
import { API_BASE } from './lib/constants';
import type { User } from './types';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SeasonList from './pages/seasons/SeasonList';
import SeasonForm from './pages/seasons/SeasonForm';
import TeamList from './pages/teams/TeamList';
import TeamForm from './pages/teams/TeamForm';
import PlayerList from './pages/players/PlayerList';
import PlayerForm from './pages/players/PlayerForm';
import WeekList from './pages/schedule/WeekList';
import WeekForm from './pages/schedule/WeekForm';
import WeekGames from './pages/schedule/WeekGames';
import GameSelect from './pages/boxscore/GameSelect';
import ScoreEntry from './pages/boxscore/ScoreEntry';
import AttendanceGrid from './pages/attendance/AttendanceGrid';
import DutyAssign from './pages/rotation/DutyAssign';
import DragonManage from './pages/dragon/DragonManage';
import AnnouncementList from './pages/announcements/AnnouncementList';
import AnnouncementForm from './pages/announcements/AnnouncementForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

function AuthInit({ children }: { children: React.ReactNode }) {
  const { setAuth, getRefreshToken, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const rt = getRefreshToken();
      if (!rt) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        if (res.ok) {
          const tokens = await res.json();
          // Refresh endpoint returns { accessToken, refreshToken } without user
          // Fetch user profile with the new token
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const user = meData.data ?? meData;
            setAuth(user, tokens.accessToken, tokens.refreshToken);
          }
        }
      } catch { /* noop */ }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthInit>
          <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="seasons" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SeasonList /></ProtectedRoute>} />
              <Route path="seasons/new" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SeasonForm /></ProtectedRoute>} />
              <Route path="seasons/:id/edit" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SeasonForm /></ProtectedRoute>} />
              <Route path="teams" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><TeamList /></ProtectedRoute>} />
              <Route path="teams/:id/edit" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><TeamForm /></ProtectedRoute>} />
              <Route path="players" element={<ProtectedRoute requiredRole="ADMIN"><PlayerList /></ProtectedRoute>} />
              <Route path="players/new" element={<ProtectedRoute requiredRole="ADMIN"><PlayerForm /></ProtectedRoute>} />
              <Route path="players/:id/edit" element={<ProtectedRoute requiredRole="ADMIN"><PlayerForm /></ProtectedRoute>} />
              <Route path="schedule" element={<ProtectedRoute requiredRole="ADMIN"><WeekList /></ProtectedRoute>} />
              <Route path="schedule/new" element={<ProtectedRoute requiredRole="ADMIN"><WeekForm /></ProtectedRoute>} />
              <Route path="schedule/:weekId" element={<ProtectedRoute requiredRole="ADMIN"><WeekGames /></ProtectedRoute>} />
              <Route path="boxscore" element={<ProtectedRoute requiredRole="ADMIN"><GameSelect /></ProtectedRoute>} />
              <Route path="boxscore/:gameId" element={<ProtectedRoute requiredRole="ADMIN"><ScoreEntry /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute requiredRole="TEAM_CAPTAIN"><AttendanceGrid /></ProtectedRoute>} />
              <Route path="rotation" element={<ProtectedRoute requiredRole="ADMIN"><DutyAssign /></ProtectedRoute>} />
              <Route path="dragon" element={<ProtectedRoute requiredRole="ADMIN"><DragonManage /></ProtectedRoute>} />
              <Route path="announcements" element={<ProtectedRoute requiredRole="ADMIN"><AnnouncementList /></ProtectedRoute>} />
              <Route path="announcements/new" element={<ProtectedRoute requiredRole="ADMIN"><AnnouncementForm /></ProtectedRoute>} />
              <Route path="announcements/:id/edit" element={<ProtectedRoute requiredRole="ADMIN"><AnnouncementForm /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><UserList /></ProtectedRoute>} />
              <Route path="users/new" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><UserForm /></ProtectedRoute>} />
              <Route path="users/:id/edit" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><UserForm /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </AuthInit>
        <Toaster position="top-right" richColors />
      </HashRouter>
    </QueryClientProvider>
  );
}
