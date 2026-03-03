export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEAM_CAPTAIN' | 'PLAYER' | 'VIEWER';
export type Phase = 'PRESEASON' | 'REGULAR' | 'PLAYOFF';
export type WeekType = 'GAME' | 'SUSPENDED';
export type GameStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';
export type AttStatus = 'PRESENT' | 'ABSENT' | 'AWOL' | 'UNKNOWN';
export type DutyType = 'REFEREE' | 'COURT' | 'PHOTO' | 'EQUIPMENT' | 'DATA';

export interface User {
  id: number;
  username: string;
  email?: string;
  displayName: string;
  role: Role;
  playerId?: number;
  lastLoginAt?: string;
}

export interface Season {
  id: number;
  number: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Team {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
  barColor?: string;
  textColor?: string;
}

export interface TeamSeason {
  id: number;
  teamId: number;
  seasonId: number;
  team: Team;
}

export interface Player {
  id: number;
  name: string;
  avatarUrl?: string;
  phone?: string;
  isReferee: boolean;
}

export interface PlayerSeason {
  id: number;
  playerId: number;
  teamSeasonId: number;
  jerseyNumber?: number;
  isCaptain: boolean;
  player: Player;
  teamSeason?: TeamSeason;
}

export interface Week {
  id: number;
  seasonId: number;
  weekNum: number;
  date: string;
  phase: Phase;
  venue: string;
  type: WeekType;
  reason?: string;
  games?: Game[];
}

export interface Game {
  id: number;
  weekId: number;
  gameNum: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore?: number;
  awayScore?: number;
  status: GameStatus;
  scheduledTime?: string;
  recorder?: string;
  homeTeam?: TeamSeason;
  awayTeam?: TeamSeason;
  week?: Week;
}

export interface PlayerGameStat {
  id: number;
  gameId: number;
  playerSeasonId: number;
  isHome: boolean;
  played: boolean;
  fg2Made: number;
  fg2Miss: number;
  fg3Made: number;
  fg3Miss: number;
  ftMade: number;
  ftMiss: number;
  pts: number;
  oreb: number;
  dreb: number;
  treb: number;
  ast: number;
  blk: number;
  stl: number;
  tov: number;
  pf: number;
  playerSeason?: PlayerSeason;
}

export interface Attendance {
  id: number;
  weekId: number;
  playerSeasonId: number;
  status: AttStatus;
}

export interface DutyRecord {
  id: number;
  gameId: number;
  playerSeasonId: number;
  dutyType: DutyType;
  playerSeason?: PlayerSeason;
}

export interface DragonScore {
  id: number;
  seasonId: number;
  playerSeasonId: number;
  attPoints: number;
  dutyPoints: number;
  mopPoints: number;
  playoffPoints?: number;
  totalPoints: number;
  playerSeason?: PlayerSeason;
}

export interface Standing {
  id: number;
  seasonId: number;
  teamSeasonId: number;
  wins: number;
  losses: number;
  pct: number;
  streak: number;
  rank?: number;
  teamSeason?: TeamSeason;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: number;
  isPinned: boolean;
  publishedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TEAM_CAPTAIN: 3,
  PLAYER: 2,
  VIEWER: 1,
};

export const PHASE_LABEL: Record<Phase, string> = {
  PRESEASON: '熱身賽',
  REGULAR: '例行賽',
  PLAYOFF: '季後賽',
};

export const ATT_LABEL: Record<AttStatus, string> = {
  PRESENT: '出席',
  ABSENT: '請假',
  AWOL: '曠賽',
  UNKNOWN: '未知',
};

export const ATT_SYMBOL: Record<AttStatus, string> = {
  PRESENT: '1',
  ABSENT: '0',
  AWOL: 'x',
  UNKNOWN: '?',
};

export const DUTY_LABEL: Record<DutyType, string> = {
  REFEREE: '裁判',
  COURT: '場務',
  PHOTO: '攝影',
  EQUIPMENT: '器材',
  DATA: '數據',
};

export const STATUS_LABEL: Record<GameStatus, string> = {
  UPCOMING: '未開始',
  LIVE: '進行中',
  FINISHED: '已完成',
};
