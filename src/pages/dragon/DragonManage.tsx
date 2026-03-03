import { useCallback, useMemo } from 'react';
import { useSeasons, useDragonScores, useRecalculateDragon, useUpdateDragonScore } from '../../hooks/useApi';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { TeamBadge } from '../../components/TeamBadge';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export default function DragonManage() {
  const formSubmit = useFormSubmit();
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: scores, isLoading } = useDragonScores(current?.id ?? 0);
  const recalc = useRecalculateDragon();
  const updateScore = useUpdateDragonScore();

  const handleRecalc = useCallback(async () => {
    if (!current) return;
    await formSubmit(() => recalc.mutateAsync(current.id), { success: '龍虎榜已重新計算' });
  }, [current, formSubmit, recalc]);

  const handleEdit = async (id: number, field: string, value: number) => {
    try {
      await updateScore.mutateAsync({ id, [field]: value });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失敗');
    }
  };

  const sorted = useMemo(
    () => [...(scores ?? [])].sort((a, b) => b.totalPoints - a.totalPoints),
    [scores],
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">龍虎榜管理</h2>
        <Button size="sm" variant="secondary" onClick={handleRecalc} loading={recalc.isPending}>
          <RefreshCw className="h-4 w-4" /> 重新計算
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">球員</th>
                <th className="pb-2 font-medium">隊伍</th>
                <th className="pb-2 font-medium text-center">出席</th>
                <th className="pb-2 font-medium text-center">輪值</th>
                <th className="pb-2 font-medium text-center">拖地</th>
                <th className="pb-2 font-medium text-center">季後賽</th>
                <th className="pb-2 font-medium text-center">總計</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 font-medium">{d.playerSeason?.player.name}</td>
                  <td className="py-2">
                    {d.playerSeason?.teamSeason.team && (
                      <TeamBadge team={d.playerSeason.teamSeason.team} size="sm" />
                    )}
                  </td>
                  <td className="py-2 text-center">{d.attPoints}</td>
                  <td className="py-2 text-center">{d.dutyPoints}</td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      className="w-14 text-center border rounded px-1 py-0.5 text-sm"
                      value={d.mopPoints}
                      onChange={(e) => handleEdit(d.id, 'mopPoints', Number(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      className="w-14 text-center border rounded px-1 py-0.5 text-sm"
                      value={d.playoffPoints ?? ''}
                      onChange={(e) => handleEdit(d.id, 'playoffPoints', Number(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 text-center font-bold text-orange-600">{d.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
