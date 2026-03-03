import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame, useBoxscore, useSaveBoxscore, usePlayers, useUpdateGame } from '../../hooks/useApi';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import type { PlayerGameStat } from '../../types';

interface StatCol {
  key: string;
  label: string;
  w: string;
  computed?: boolean;
}

const STAT_COLS: StatCol[] = [
  { key: 'fg2Made', label: '2P\u2715', w: 'w-12' },
  { key: 'fg2Miss', label: '2P\u25CB', w: 'w-12' },
  { key: 'fg3Made', label: '3P\u2715', w: 'w-12' },
  { key: 'fg3Miss', label: '3P\u25CB', w: 'w-12' },
  { key: 'ftMade', label: 'FT\u2715', w: 'w-12' },
  { key: 'ftMiss', label: 'FT\u25CB', w: 'w-12' },
  { key: 'pts', label: 'PTS', w: 'w-12', computed: true },
  { key: 'oreb', label: 'OR', w: 'w-10' },
  { key: 'dreb', label: 'DR', w: 'w-10' },
  { key: 'ast', label: 'AST', w: 'w-12' },
  { key: 'blk', label: 'BLK', w: 'w-12' },
  { key: 'stl', label: 'STL', w: 'w-12' },
  { key: 'tov', label: 'TO', w: 'w-10' },
  { key: 'pf', label: 'PF', w: 'w-10' },
];

interface StatRow {
  playerSeasonId: number;
  name: string;
  fg2Made: number; fg2Miss: number;
  fg3Made: number; fg3Miss: number;
  ftMade: number; ftMiss: number;
  pts: number; oreb: number; dreb: number;
  ast: number; blk: number; stl: number;
  tov: number; pf: number;
  [key: string]: string | number;
}

function calcPts(r: StatRow): number {
  return (r.fg2Made ?? 0) * 2 + (r.fg3Made ?? 0) * 3 + (r.ftMade ?? 0);
}

function emptyRow(psId: number, name: string): StatRow {
  const row: StatRow = {
    playerSeasonId: psId,
    name,
    fg2Made: 0, fg2Miss: 0,
    fg3Made: 0, fg3Miss: 0,
    ftMade: 0, ftMiss: 0,
    pts: 0, oreb: 0, dreb: 0,
    ast: 0, blk: 0, stl: 0,
    tov: 0, pf: 0,
  };
  return row;
}

export default function ScoreEntry() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const formSubmit = useFormSubmit();
  const gid = Number(gameId);
  const { data: game, isLoading: gLoading } = useGame(gid);
  const { data: existingStats, isLoading: bLoading } = useBoxscore(gid);
  const { data: homePlayersRaw } = usePlayers({ teamId: game?.homeTeam?.teamId });
  const { data: awayPlayersRaw } = usePlayers({ teamId: game?.awayTeam?.teamId });
  // Filter to only the correct TeamSeason (memoized to prevent infinite re-render)
  const homePlayers = useMemo(
    () => homePlayersRaw?.filter((ps) => ps.teamSeasonId === game?.homeTeamId),
    [homePlayersRaw, game?.homeTeamId],
  );
  const awayPlayers = useMemo(
    () => awayPlayersRaw?.filter((ps) => ps.teamSeasonId === game?.awayTeamId),
    [awayPlayersRaw, game?.awayTeamId],
  );
  const saveBoxscore = useSaveBoxscore();
  const updateGame = useUpdateGame();

  const [homeRows, setHomeRows] = useState<StatRow[]>([]);
  const [awayRows, setAwayRows] = useState<StatRow[]>([]);

  // Initialize rows from existing stats or from player roster
  useEffect(() => {
    if (gLoading || bLoading) return;

    const buildRows = (players: typeof homePlayers, isHome: boolean): StatRow[] => {
      if (!players) return [];
      return players.map((ps) => {
        const existing = existingStats?.find((s) => s.playerSeasonId === ps.id && s.isHome === isHome);
        if (existing) {
          const { id: _id, gameId: _gid, isHome: _ih, played: _p, treb: _tr, playerSeason: _ps, ...statFields } = existing;
          return { ...statFields, name: ps.player.name } as StatRow;
        }
        return emptyRow(ps.id, ps.player.name);
      });
    };

    if (homePlayers) setHomeRows(buildRows(homePlayers, true));
    if (awayPlayers) setAwayRows(buildRows(awayPlayers, false));
  }, [existingStats, homePlayers, awayPlayers, gLoading, bLoading]);

  const updateCell = useCallback((isHome: boolean, idx: number, key: string, val: number) => {
    const setter = isHome ? setHomeRows : setAwayRows;
    setter((rows) => {
      const updated = [...rows];
      updated[idx] = { ...updated[idx], [key]: val };
      updated[idx].pts = calcPts(updated[idx]);
      return updated;
    });
  }, []);

  const calcTotal = (rows: StatRow[], key: string) =>
    rows.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);

  const handleSave = useCallback(async () => {
    const stats: Partial<PlayerGameStat>[] = [
      ...homeRows.map((r) => ({ ...r, isHome: true, played: true, treb: (r.oreb ?? 0) + (r.dreb ?? 0) })),
      ...awayRows.map((r) => ({ ...r, isHome: false, played: true, treb: (r.oreb ?? 0) + (r.dreb ?? 0) })),
    ];
    await formSubmit(async () => {
      await saveBoxscore.mutateAsync({ gameId: gid, stats });
      // Update game score and status
      const homeScore = calcTotal(homeRows, 'pts');
      const awayScore = calcTotal(awayRows, 'pts');
      await updateGame.mutateAsync({ id: gid, homeScore, awayScore, status: 'FINISHED' });
    }, { success: '數據已儲存' });
  }, [homeRows, awayRows, gid, formSubmit, saveBoxscore, updateGame]);

  if (gLoading || bLoading) return <Spinner />;
  if (!game) return <p className="text-gray-500">找不到此比賽</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to="/boxscore" className="text-sm text-gray-500 hover:underline">&larr; 返回比賽列表</Link>
        <h2 className="text-xl font-bold text-gray-800 mt-1">
          第 {game.gameNum} 場
          {game.homeTeam && game.awayTeam && (
            <span className="ml-2">
              {game.homeTeam.team.shortName} vs {game.awayTeam.team.shortName}
            </span>
          )}
        </h2>
      </div>

      {/* Home team */}
      <Card
        title={game.homeTeam ? `主隊：${game.homeTeam.team.shortName}隊` : '主隊'}
        action={<span className="text-lg font-bold">{calcTotal(homeRows, 'pts')}</span>}
      >
        <StatTable rows={homeRows} isHome={true} onChange={updateCell} calcTotal={calcTotal} />
      </Card>

      {/* Away team */}
      <Card
        title={game.awayTeam ? `客隊：${game.awayTeam.team.shortName}隊` : '客隊'}
        action={<span className="text-lg font-bold">{calcTotal(awayRows, 'pts')}</span>}
      >
        <StatTable rows={awayRows} isHome={false} onChange={updateCell} calcTotal={calcTotal} />
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saveBoxscore.isPending || updateGame.isPending}>
          儲存
        </Button>
        <Button variant="secondary" onClick={() => navigate('/boxscore')}>取消</Button>
      </div>
    </div>
  );
}

function StatTable({
  rows,
  isHome,
  onChange,
  calcTotal,
}: {
  rows: StatRow[];
  isHome: boolean;
  onChange: (isHome: boolean, idx: number, key: string, val: number) => void;
  calcTotal: (rows: StatRow[], key: string) => number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="pb-1.5 text-left font-medium w-20">球員</th>
            {STAT_COLS.map((c) => (
              <th key={c.key} className={`pb-1.5 text-center font-medium ${c.w}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={row.playerSeasonId} className="hover:bg-gray-50">
              <td className="py-1 font-medium text-sm">{row.name}</td>
              {STAT_COLS.map((c) => (
                <td key={c.key} className="py-1 text-center">
                  {c.computed ? (
                    <span className="font-bold text-orange-600">{row.pts}</span>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={row[c.key] ?? 0}
                      onChange={(e) => onChange(isHome, i, c.key, Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-center border border-gray-200 rounded px-1 py-0.5 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 font-bold text-sm">
            <td className="py-1.5">合計</td>
            {STAT_COLS.map((c) => (
              <td key={c.key} className="py-1.5 text-center">
                {calcTotal(rows, c.key)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
