import { useEffect, useState } from 'react';
import { useSeasons, useWeeks, usePlayers, useAttendanceBySeason, useSaveAttendance } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { TeamBadge } from '../../components/TeamBadge';
import { formatDate } from '../../lib/utils';
import { ATT_SYMBOL, type AttStatus } from '../../types';
import { toast } from 'sonner';

const ATT_CYCLE: AttStatus[] = ['UNKNOWN', 'PRESENT', 'ABSENT', 'AWOL'];
const ATT_COLORS: Record<AttStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300',
  ABSENT: 'bg-gray-100 text-gray-500 border-gray-300',
  AWOL: 'bg-red-100 text-red-600 border-red-300',
  UNKNOWN: 'bg-yellow-50 text-yellow-600 border-yellow-300',
};

type GridData = Map<string, AttStatus>; // key = `${weekId}-${playerSeasonId}`

export default function AttendanceGrid() {
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: weeks, isLoading: wl } = useWeeks(current?.id);
  const { data: players, isLoading: pl } = usePlayers();
  const { data: attData, isLoading: al } = useAttendanceBySeason(current?.id ?? 0);
  const save = useSaveAttendance();

  const [grid, setGrid] = useState<GridData>(new Map());
  const [dirty, setDirty] = useState(new Set<number>()); // weekIds that changed

  const gameWeeks = weeks?.filter((w) => w.type === 'GAME')?.sort((a, b) => a.weekNum - b.weekNum) ?? [];

  useEffect(() => {
    if (!attData) return;
    // attData is { weeks, records } where records is Attendance[]
    const records = Array.isArray(attData) ? attData : attData.records ?? [];
    const g = new Map<string, AttStatus>();
    for (const a of records) {
      g.set(`${a.weekId}-${a.playerSeasonId}`, a.status);
    }
    setGrid(g);
  }, [attData]);

  const toggle = (weekId: number, psId: number) => {
    const key = `${weekId}-${psId}`;
    const currentStatus = grid.get(key) ?? 'UNKNOWN';
    const nextIdx = (ATT_CYCLE.indexOf(currentStatus) + 1) % ATT_CYCLE.length;
    setGrid((g) => {
      const next = new Map(g);
      next.set(key, ATT_CYCLE[nextIdx]);
      return next;
    });
    setDirty((d) => new Set(d).add(weekId));
  };

  const handleSave = async () => {
    for (const weekId of dirty) {
      const records = (filteredPlayers ?? []).map((ps) => ({
        playerSeasonId: ps.id,
        status: grid.get(`${weekId}-${ps.id}`) ?? 'UNKNOWN',
      }));
      try {
        await save.mutateAsync({ weekId, records });
      } catch (err: any) {
        toast.error(`W${weekId}: ${err.message}`);
        return;
      }
    }
    toast.success('出席已儲存');
    setDirty(new Set());
  };

  const filteredPlayers = players;

  // Group players by team
  const teams = new Map<string, typeof filteredPlayers>();
  for (const ps of filteredPlayers ?? []) {
    const code = ps.teamSeason?.team?.code ?? 'unknown';
    if (!teams.has(code)) teams.set(code, []);
    teams.get(code)!.push(ps);
  }

  if (wl || pl || al) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">出席管理</h2>
        <Button onClick={handleSave} loading={save.isPending} disabled={dirty.size === 0}>
          批次儲存
        </Button>
      </div>

      <p className="text-xs text-gray-500">點擊循環切換：? → 1 → 0 → x</p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2 text-left font-medium sticky left-0 bg-white min-w-[100px]">球員</th>
                {gameWeeks.map((w) => (
                  <th key={w.id} className="pb-2 text-center font-medium min-w-[50px]">
                    <div>W{w.weekNum}</div>
                    <div className="text-[10px] text-gray-400">{formatDate(w.date).slice(5)}</div>
                  </th>
                ))}
                <th className="pb-2 text-center font-medium min-w-[50px]">出席率</th>
              </tr>
            </thead>
            <tbody>
              {[...teams.entries()].map(([code, teamPlayers]) => (
                teamPlayers!.map((ps, i) => {
                  const present = gameWeeks.filter((w) => grid.get(`${w.id}-${ps.id}`) === 'PRESENT').length;
                  const total = gameWeeks.filter((w) => grid.get(`${w.id}-${ps.id}`) !== 'UNKNOWN').length;
                  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

                  return (
                    <tr key={ps.id} className={i === 0 ? 'border-t-2 border-gray-300' : 'border-t border-gray-100'}>
                      <td className="py-1 sticky left-0 bg-white">
                        <div className="flex items-center gap-1">
                          {ps.teamSeason?.team && <TeamBadge team={ps.teamSeason.team} size="sm" />}
                          <span className="font-medium">{ps.player.name}</span>
                        </div>
                      </td>
                      {gameWeeks.map((w) => {
                        const status = grid.get(`${w.id}-${ps.id}`) ?? 'UNKNOWN';
                        return (
                          <td key={w.id} className="py-1 text-center">
                            <button
                              onClick={() => toggle(w.id, ps.id)}
                              className={`w-8 h-7 rounded border text-xs font-bold cursor-pointer transition-colors ${ATT_COLORS[status]}`}
                            >
                              {ATT_SYMBOL[status]}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-1 text-center text-gray-500">{pct}%</td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
