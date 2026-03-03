import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers, useSeasons, useTeams } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TeamBadge } from '../../components/TeamBadge';
import { Spinner } from '../../components/ui/Spinner';
import { Plus, Search } from 'lucide-react';

export default function PlayerList() {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const { data: seasons } = useSeasons();
  const { data: teams } = useTeams();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: players, isLoading } = usePlayers({
    search: search || undefined,
    teamId: teamFilter ? Number(teamFilter) : undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">球員管理</h2>
        <Link to="/players/new">
          <Button size="sm"><Plus className="h-4 w-4" /> 新增球員</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            placeholder="搜尋球員姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        >
          <option value="">全部隊伍</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>{t.shortName}隊</option>
          ))}
        </select>
      </div>

      <Card>
        {isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">姓名</th>
                <th className="pb-2 font-medium">隊伍</th>
                <th className="pb-2 font-medium">背號</th>
                <th className="pb-2 font-medium">身份</th>
                <th className="pb-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players?.map((ps) => (
                <tr key={ps.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium">{ps.player.name}</td>
                  <td className="py-2.5">
                    {ps.teamSeason?.team ? <TeamBadge team={ps.teamSeason.team} size="sm" /> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-2.5 text-gray-500">{ps.jerseyNumber ?? '-'}</td>
                  <td className="py-2.5 space-x-1">
                    {ps.isCaptain && <Badge variant="info">隊長</Badge>}
                    {ps.player.isReferee && <Badge variant="warning">裁判</Badge>}
                  </td>
                  <td className="py-2.5">
                    <Link to={`/players/${ps.player.id}/edit`} className="text-orange-500 hover:underline text-xs">
                      編輯
                    </Link>
                  </td>
                </tr>
              ))}
              {(!players || players.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">無資料</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
