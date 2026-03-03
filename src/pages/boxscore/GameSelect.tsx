import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeeks, useSeasons, useGames } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { TeamBadge } from '../../components/TeamBadge';
import { formatDate } from '../../lib/utils';
import { STATUS_LABEL } from '../../types';

export default function GameSelect() {
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: weeks, isLoading } = useWeeks(current?.id);
  const gameWeeks = weeks?.filter((w) => w.type === 'GAME')?.sort((a, b) => b.weekNum - a.weekNum) ?? [];
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Auto-select first week with unfinished games, or latest
  const autoWeek = selectedWeek ?? gameWeeks.find((w) => w.games?.some((g) => g.status !== 'FINISHED'))?.id ?? gameWeeks[0]?.id;
  const { data: games, isLoading: gl } = useGames(autoWeek);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">數據輸入</h2>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium text-gray-600">選擇週次：</label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={autoWeek ?? ''}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
        >
          {gameWeeks.map((w) => (
            <option key={w.id} value={w.id}>
              第 {w.weekNum} 週 - {formatDate(w.date)} ({w.venue})
            </option>
          ))}
        </select>
      </div>

      <Card>
        {gl ? (
          <Spinner className="h-5 w-5" />
        ) : !games || games.length === 0 ? (
          <p className="text-sm text-gray-400">此週無比賽</p>
        ) : (
          <div className="divide-y">
            {games.map((g) => (
              <Link
                key={g.id}
                to={`/boxscore/${g.id}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">第 {g.gameNum} 場</span>
                  {g.homeTeam && <TeamBadge team={g.homeTeam.team} />}
                  <span className="font-bold text-lg min-w-[60px] text-center">
                    {g.homeScore ?? '--'} : {g.awayScore ?? '--'}
                  </span>
                  {g.awayTeam && <TeamBadge team={g.awayTeam.team} />}
                </div>
                <Badge variant={g.status === 'FINISHED' ? 'success' : 'warning'}>
                  {g.status === 'FINISHED' ? '已輸入' : '待輸入'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
