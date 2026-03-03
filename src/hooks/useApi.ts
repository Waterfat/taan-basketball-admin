import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type {
  Season, Team, TeamSeason, Player, PlayerSeason, Week, Game,
  PlayerGameStat, Attendance, DutyRecord, DragonScore, Standing,
  Announcement, User, PaginatedResponse,
} from '../types';

// ─── Seasons ───
export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiClient<Season[]>('/admin/seasons'),
  });
}

export function useSeason(id: number) {
  return useQuery({
    queryKey: ['seasons', id],
    queryFn: () => apiClient<Season>(`/admin/seasons/${id}`),
    enabled: !!id,
  });
}

export function useCreateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Season>) =>
      apiClient<Season>('/admin/seasons', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useUpdateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Season> & { id: number }) =>
      apiClient<Season>(`/admin/seasons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

// ─── Teams ───
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => apiClient<Team[]>('/admin/teams'),
  });
}

export function useTeam(id: number) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => apiClient<Team>(`/admin/teams/${id}`),
    enabled: !!id,
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Team> & { id: number }) =>
      apiClient<Team>(`/admin/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useTeamSeasons(seasonId?: number) {
  return useQuery({
    queryKey: ['teamSeasons', seasonId],
    queryFn: () => apiClient<TeamSeason[]>(`/admin/teams?seasonId=${seasonId}&withSeason=true`),
    enabled: !!seasonId,
  });
}

// ─── Players ───
export function usePlayers(params?: { teamSeasonId?: number; search?: string }) {
  const sp = new URLSearchParams();
  if (params?.teamSeasonId) sp.set('teamSeasonId', String(params.teamSeasonId));
  if (params?.search) sp.set('search', params.search);
  const q = sp.toString();
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => apiClient<PlayerSeason[]>(`/admin/players${q ? `?${q}` : ''}`),
  });
}

export function usePlayer(id: number) {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => apiClient<PlayerSeason>(`/admin/players/${id}`),
    enabled: !!id,
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; teamSeasonId: number; jerseyNumber?: number; isCaptain?: boolean; isReferee?: boolean; phone?: string }) =>
      apiClient('/admin/players', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      apiClient(`/admin/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient(`/admin/players/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

// ─── Weeks ───
export function useWeeks(seasonId?: number) {
  return useQuery({
    queryKey: ['weeks', seasonId],
    queryFn: () => apiClient<Week[]>(`/admin/weeks?seasonId=${seasonId}`),
    enabled: !!seasonId,
  });
}

export function useWeek(id: number) {
  return useQuery({
    queryKey: ['weeks', 'detail', id],
    queryFn: () => apiClient<Week>(`/admin/weeks/${id}`),
    enabled: !!id,
  });
}

export function useCreateWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Week>) =>
      apiClient<Week>('/admin/weeks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weeks'] }),
  });
}

export function useUpdateWeek() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Week> & { id: number }) =>
      apiClient<Week>(`/admin/weeks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weeks'] }),
  });
}

// ─── Games ───
export function useGames(weekId?: number) {
  return useQuery({
    queryKey: ['games', weekId],
    queryFn: () => apiClient<Game[]>(`/admin/games?weekId=${weekId}`),
    enabled: !!weekId,
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['games', 'detail', id],
    queryFn: () => apiClient<Game>(`/admin/games/${id}`),
    enabled: !!id,
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Game> & { id: number }) =>
      apiClient<Game>(`/admin/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
}

// ─── Boxscore ───
export function useBoxscore(gameId: number) {
  return useQuery({
    queryKey: ['boxscore', gameId],
    queryFn: () => apiClient<PlayerGameStat[]>(`/admin/boxscore/${gameId}`),
    enabled: !!gameId,
  });
}

export function useSaveBoxscore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gameId, stats }: { gameId: number; stats: Partial<PlayerGameStat>[] }) =>
      apiClient(`/admin/boxscore/${gameId}`, { method: 'PUT', body: JSON.stringify({ stats }) }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['boxscore', v.gameId] });
      qc.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// ─── Attendance ───
export function useAttendanceByWeek(weekId: number) {
  return useQuery({
    queryKey: ['attendance', 'week', weekId],
    queryFn: () => apiClient<Attendance[]>(`/admin/attendance?weekId=${weekId}`),
    enabled: !!weekId,
  });
}

export function useAttendanceBySeason(seasonId: number) {
  return useQuery({
    queryKey: ['attendance', 'season', seasonId],
    queryFn: () => apiClient<Attendance[]>(`/admin/attendance?seasonId=${seasonId}`),
    enabled: !!seasonId,
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { weekId: number; records: { playerSeasonId: number; status: string }[] }) =>
      apiClient('/admin/attendance', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

// ─── Duties ───
export function useDuties(gameId?: number) {
  return useQuery({
    queryKey: ['duties', gameId],
    queryFn: () => apiClient<DutyRecord[]>(`/admin/duties?gameId=${gameId}`),
    enabled: !!gameId,
  });
}

export function useSaveDuties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { gameId: number; duties: { playerSeasonId: number; dutyType: string }[] }) =>
      apiClient('/admin/duties', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['duties'] }),
  });
}

// ─── Dragon ───
export function useDragonScores(seasonId: number) {
  return useQuery({
    queryKey: ['dragon', seasonId],
    queryFn: () => apiClient<DragonScore[]>(`/admin/dragon?seasonId=${seasonId}`),
    enabled: !!seasonId,
  });
}

export function useRecalculateDragon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: number) =>
      apiClient(`/admin/dragon/recalculate`, { method: 'POST', body: JSON.stringify({ seasonId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dragon'] }),
  });
}

export function useUpdateDragonScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      apiClient(`/admin/dragon/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dragon'] }),
  });
}

// ─── Standings ───
export function useStandings(seasonId: number) {
  return useQuery({
    queryKey: ['standings', seasonId],
    queryFn: () => apiClient<Standing[]>(`/admin/standings?seasonId=${seasonId}`),
    enabled: !!seasonId,
  });
}

export function useRecalculateStandings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: number) =>
      apiClient(`/admin/standings/recalculate`, { method: 'POST', body: JSON.stringify({ seasonId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['standings'] }),
  });
}

// ─── Announcements ───
export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiClient<Announcement[]>('/admin/announcements'),
  });
}

export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: () => apiClient<Announcement>(`/admin/announcements/${id}`),
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) =>
      apiClient('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Announcement> & { id: number }) =>
      apiClient(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient(`/admin/announcements/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

// ─── Users ───
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient<User[]>('/admin/users'),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient<User>(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { username: string; password: string; displayName: string; role: string }) =>
      apiClient('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      apiClient(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
