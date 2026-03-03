import { useParams, Link } from 'react-router-dom';
import { useWeek, useGames } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { TeamBadge } from '../../components/TeamBadge';
import { formatDate } from '../../lib/utils';
import { STATUS_LABEL, PHASE_LABEL } from '../../types';

export default function WeekGames() {
  const { weekId } = useParams();
  const { data: week, isLoading: wl } = useWeek(Number(weekId));
  const { data: games, isLoading: gl } = useGames(Number(weekId));

  if (wl || gl) return <Spinner />;
  if (!week) return <p className="text-gray-500">找不到此週次</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to="/schedule" className="text-sm text-gray-500 hover:underline">&larr; 返回賽程</Link>
        <h2 className="text-xl font-bold text-gray-800 mt-1">
          第 {week.weekNum} 週 · {formatDate(week.date)} · {PHASE_LABEL[week.phase]}
        </h2>
        <p className="text-sm text-gray-500">{week.venue}</p>
      </div>

      <Card title={`比賽列表 (${games?.length ?? 0} 場)`}>
        {!games || games.length === 0 ? (
          <p className="text-sm text-gray-400">尚無比賽</p>
        ) : (
          <div className="divide-y">
            {games.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">第 {g.gameNum} 場</span>
                  {g.homeTeam && <TeamBadge team={g.homeTeam.team} />}
                  <span className="font-bold text-lg min-w-[60px] text-center">
                    {g.homeScore ?? '--'} : {g.awayScore ?? '--'}
                  </span>
                  {g.awayTeam && <TeamBadge team={g.awayTeam.team} />}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={g.status === 'FINISHED' ? 'success' : g.status === 'LIVE' ? 'warning' : 'default'}>
                    {STATUS_LABEL[g.status]}
                  </Badge>
                  <Link to={`/boxscore/${g.id}`} className="text-orange-500 hover:underline text-xs">
                    數據輸入
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
