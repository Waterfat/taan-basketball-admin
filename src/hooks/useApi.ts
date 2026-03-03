import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type {
  Season, Team, TeamSeason, Player, PlayerSeason, Week, Game,
  PlayerGameStat, Attendance, DutyRecord, DragonScore, Standing,
  Announcement, User, Role,
} from '../types';

// ─── Mutation data types ───
export interface DragonScoreUpdate {
  id: number;
  mopPoints?: number;
  playoffPoints?: number;
}

export interface UserUpdateData {
  id: number;
  displayName?: string;
  role?: Role;
  password?: string;
}

// ─── Raw API shape for Player (includes nested playerSeasons) ───
interface PlayerApiResponse extends Player {
  playerSeasons?: Array<Omit<PlayerSeason, 'player'>>;
}

// ─── Helper: transform Player (API shape) → PlayerSeason[] ───
function playerToPlayerSeasons(p: PlayerApiResponse): PlayerSeason[] {
  const { playerSeasons, ...playerFields } = p;
  if (!playerSeasons || !Array.isArray(playerSeasons)) return [];
  return playerSeasons.map((ps) => ({
    ...ps,
    player: { id: playerFields.id, name: playerFields.name, avatarUrl: playerFields.avatarUrl, phone: playerFields.phone, isReferee: playerFields.isReferee },
  }));
}

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
      apiClient<Season>(`/admin/seasons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
      apiClient<Team>(`/admin/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useEnsureTeamSeason() {
  return useMutation({
    mutationFn: ({ teamId, seasonId }: { teamId: number; seasonId: number }) =>
      apiClient<TeamSeason>(`/admin/teams/${teamId}/seasons/${seasonId}`, { method: 'POST' }),
  });
}

// ─── Players ───
export function usePlayers(params?: { teamId?: number; search?: string }) {
  const sp = new URLSearchParams();
  if (params?.teamId) sp.set('teamId', String(params.teamId));
  if (params?.search) sp.set('search', params.search);
  const q = sp.toString();
  return useQuery({
    queryKey: ['players', params],
    queryFn: async () => {
      const players = await apiClient<PlayerApiResponse[]>(`/admin/players${q ? `?${q}` : ''}`);
      return players.flatMap(playerToPlayerSeasons);
    },
  });
}

export function usePlayer(playerId: number) {
  return useQuery({
    queryKey: ['players', 'detail', playerId],
    queryFn: async () => {
      const p = await apiClient<PlayerApiResponse>(`/admin/players/${playerId}`);
      const seasons = playerToPlayerSeasons(p);
      // Return the most recent PlayerSeason (last in array), or construct one
      if (seasons.length > 0) return seasons[seasons.length - 1];
      // No season assignment yet - return a minimal object
      return { id: 0, playerId: p.id, teamSeasonId: 0, jerseyNumber: undefined, isCaptain: false, player: { id: p.id, name: p.name, avatarUrl: p.avatarUrl, phone: p.phone, isReferee: p.isReferee } } satisfies PlayerSeason;
    },
    enabled: !!playerId,
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; teamId: number; seasonId: number; jerseyNumber?: number; isCaptain?: boolean; isReferee?: boolean; phone?: string }) => {
      // Step 1: Create the Player record
      const player = await apiClient<Player>('/admin/players', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, phone: data.phone, isReferee: data.isReferee ?? false }),
      });
      // Step 2: Ensure TeamSeason exists
      const teamSeason = await apiClient<TeamSeason>(`/admin/teams/${data.teamId}/seasons/${data.seasonId}`, {
        method: 'POST',
      });
      // Step 3: Assign player to team
      await apiClient(`/admin/players/${player.id}/assign-team`, {
        method: 'POST',
        body: JSON.stringify({ teamSeasonId: teamSeason.id, jerseyNumber: data.jerseyNumber, isCaptain: data.isCaptain }),
      });
      return player;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ playerId, teamSeasonId, jerseyNumber, isCaptain, ...playerData }: { playerId: number; teamSeasonId?: number; jerseyNumber?: number; isCaptain?: boolean; name?: string; phone?: string; isReferee?: boolean }) => {
      // Update Player fields
      await apiClient(`/admin/players/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify(playerData),
      });
      // Update team assignment if teamSeasonId provided
      if (teamSeasonId) {
        await apiClient(`/admin/players/${playerId}/assign-team`, {
          method: 'POST',
          body: JSON.stringify({ teamSeasonId, jerseyNumber, isCaptain }),
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: number) => apiClient(`/admin/players/${playerId}`, { method: 'DELETE' }),
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
      apiClient<Week>(`/admin/weeks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
      apiClient<Game>(`/admin/games/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
    queryFn: () => apiClient<PlayerGameStat[]>(`/admin/games/${gameId}/boxscore`),
    enabled: !!gameId,
  });
}

export function useSaveBoxscore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gameId, stats }: { gameId: number; stats: Partial<PlayerGameStat>[] }) =>
      apiClient(`/admin/games/${gameId}/boxscore`, { method: 'POST', body: JSON.stringify({ stats }) }),
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

export interface AttendanceSeasonData {
  weeks: { id: number; weekNum: number; date: string }[];
  records: Attendance[];
}

export function useAttendanceBySeason(seasonId: number) {
  return useQuery({
    queryKey: ['attendance', 'season', seasonId],
    queryFn: () => apiClient<AttendanceSeasonData>(`/admin/attendance?seasonId=${seasonId}`),
    enabled: !!seasonId,
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { weekId: number; records: { playerSeasonId: number; status: string }[] }) =>
      apiClient('/admin/attendance/batch', {
        method: 'POST',
        body: JSON.stringify({
          entries: data.records.map((r) => ({ weekId: data.weekId, playerSeasonId: r.playerSeasonId, status: r.status })),
        }),
      }),
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
      apiClient('/admin/duties/batch', {
        method: 'POST',
        body: JSON.stringify({
          entries: data.duties.map((d) => ({ gameId: data.gameId, playerSeasonId: d.playerSeasonId, dutyType: d.dutyType })),
        }),
      }),
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
    mutationFn: ({ id, ...data }: DragonScoreUpdate) =>
      apiClient(`/admin/dragon/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
      apiClient(`/admin/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
    mutationFn: ({ id, ...data }: UserUpdateData) =>
      apiClient(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
