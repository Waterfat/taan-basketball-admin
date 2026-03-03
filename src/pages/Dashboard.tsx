import { Link } from 'react-router-dom';
import { useSeasons, useWeeks, useTeams } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Calendar, Users, Trophy, AlertCircle } from 'lucide-react';
import { formatDate, filterGameWeeks } from '../lib/utils';

export default function Dashboard() {
  const { data: seasons, isLoading: sl } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: weeks, isLoading: wl } = useWeeks(current?.id);
  const { data: teams } = useTeams();

  if (sl) return <Spinner />;

  const gameWeeks = filterGameWeeks(weeks, false);

  const now = new Date();
  const currentWeek = gameWeeks
    .sort((a, b) => Math.abs(new Date(a.date).getTime() - now.getTime()) - Math.abs(new Date(b.date).getTime() - now.getTime()))[0];

  const totalGames = gameWeeks.reduce((sum, w) => sum + (w.games?.length ?? 0), 0);
  const finishedGames = gameWeeks.reduce(
    (sum, w) => sum + (w.games?.filter((g) => g.status === 'FINISHED').length ?? 0), 0,
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">總覽</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="h-5 w-5 text-orange-500" />}
          title="目前賽季"
          value={current?.name ?? `第 ${current?.number} 屆`}
          sub={current?.startDate ? `開始: ${formatDate(current.startDate)}` : ''}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          title="本週賽程"
          value={currentWeek ? `第 ${currentWeek.weekNum} 週` : '無'}
          sub={currentWeek ? `${formatDate(currentWeek.date)} · ${currentWeek.venue}` : ''}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-green-500" />}
          title="隊伍數"
          value={String(teams?.length ?? 0)}
          sub="支參賽隊伍"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          title="比賽進度"
          value={`${finishedGames} / ${totalGames}`}
          sub="場比賽已完成"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="最近賽程">
          {wl ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <div className="divide-y">
              {gameWeeks.slice(-5).reverse().map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">W{w.weekNum}</span>
                    <span className="text-gray-500 ml-2">{formatDate(w.date)}</span>
                    <span className="text-gray-400 ml-2">{w.venue}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {w.games?.filter((g) => g.status === 'FINISHED').length ?? 0}/{w.games?.length ?? 0} 完成
                  </span>
                </div>
              ))}
              {gameWeeks.length === 0 && <p className="text-sm text-gray-400 py-2">尚無賽程</p>}
            </div>
          )}
        </Card>

        <Card title="快速操作">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '輸入數據', to: '/boxscore', color: 'bg-orange-50 text-orange-700 border-orange-200' },
              { label: '管理出席', to: '/attendance', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: '編輯賽程', to: '/schedule', color: 'bg-green-50 text-green-700 border-green-200' },
              { label: '管理球員', to: '/players', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-lg border p-3 text-center text-sm font-medium transition-colors hover:shadow-sm ${item.color}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{title}</span>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
