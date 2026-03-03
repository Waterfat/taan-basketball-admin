import { useCallback, useMemo, useState } from 'react';
import { useSeasons, useWeeks, useGames, usePlayers, useDuties, useSaveDuties } from '../../hooks/useApi';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, filterGameWeeks } from '../../lib/utils';
import { DUTY_LABEL, type DutyType } from '../../types';

const DUTY_TYPES: DutyType[] = ['REFEREE', 'COURT', 'PHOTO', 'EQUIPMENT', 'DATA'];

export default function DutyAssign() {
  const formSubmit = useFormSubmit();
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: weeks } = useWeeks(current?.id);
  const { data: players } = usePlayers();
  const gameWeeks = useMemo(() => filterGameWeeks(weeks), [weeks]);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const weekId = selectedWeek ?? gameWeeks[0]?.id;
  const { data: games, isLoading: gl } = useGames(weekId);

  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const gameId = selectedGame ?? games?.[0]?.id;
  const { data: duties, isLoading: dl } = useDuties(gameId);
  const save = useSaveDuties();

  const [assignments, setAssignments] = useState<Map<string, number>>(new Map()); // dutyType -> playerSeasonId

  const handleAssign = (dutyType: DutyType, psId: number) => {
    setAssignments((m) => {
      const next = new Map(m);
      next.set(dutyType, psId);
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    if (!gameId) return;
    const dutiesList = [...assignments.entries()].map(([dutyType, playerSeasonId]) => ({
      dutyType,
      playerSeasonId,
    }));
    await formSubmit(() => save.mutateAsync({ gameId, duties: dutiesList }), { success: '輪值已儲存' });
  }, [gameId, assignments, formSubmit, save]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">輪值排班</h2>

      <div className="flex gap-3 items-center">
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={weekId ?? ''}
          onChange={(e) => { setSelectedWeek(Number(e.target.value)); setSelectedGame(null); }}
        >
          {gameWeeks.map((w) => (
            <option key={w.id} value={w.id}>第 {w.weekNum} 週 - {formatDate(w.date)}</option>
          ))}
        </select>
        {games && (
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={gameId ?? ''}
            onChange={(e) => setSelectedGame(Number(e.target.value))}
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                第 {g.gameNum} 場 {g.homeTeam?.team.shortName} vs {g.awayTeam?.team.shortName}
              </option>
            ))}
          </select>
        )}
      </div>

      {gl || dl ? (
        <Spinner className="h-5 w-5" />
      ) : (
        <Card title="指派輪值" action={
          <Button size="sm" onClick={handleSave} loading={save.isPending}>儲存</Button>
        }>
          <div className="space-y-4">
            {DUTY_TYPES.map((dt) => {
              const existing = duties?.find((d) => d.dutyType === dt);
              const assigned = assignments.get(dt) ?? existing?.playerSeasonId;

              return (
                <div key={dt} className="flex items-center gap-3">
                  <Badge variant="info" className="min-w-[60px] justify-center">{DUTY_LABEL[dt]}</Badge>
                  <select
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={assigned ?? ''}
                    onChange={(e) => handleAssign(dt, Number(e.target.value))}
                  >
                    <option value="">未指派</option>
                    {players?.map((ps) => (
                      <option key={ps.id} value={ps.id}>
                        {ps.player.name} ({ps.teamSeason?.team?.shortName ?? '?'})
                      </option>
                    ))}
                  </select>
                  {existing?.playerSeason && (
                    <span className="text-xs text-gray-400">
                      目前: {existing.playerSeason.player.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
