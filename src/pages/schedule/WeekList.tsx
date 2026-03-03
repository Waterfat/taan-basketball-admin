import { Link } from 'react-router-dom';
import { useWeeks, useSeasons } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import { PHASE_LABEL } from '../../types';
import { Plus } from 'lucide-react';

export default function WeekList() {
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const { data: weeks, isLoading } = useWeeks(current?.id);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">賽程管理</h2>
        <Link to="/schedule/new">
          <Button size="sm"><Plus className="h-4 w-4" /> 新增週次</Button>
        </Link>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">週次</th>
              <th className="pb-2 font-medium">日期</th>
              <th className="pb-2 font-medium">賽制</th>
              <th className="pb-2 font-medium">場地</th>
              <th className="pb-2 font-medium">狀態</th>
              <th className="pb-2 font-medium">比賽</th>
              <th className="pb-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {weeks?.map((w) => {
              const finished = w.games?.filter((g) => g.status === 'FINISHED').length ?? 0;
              const total = w.games?.length ?? 0;
              return (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium">
                    {w.type === 'SUSPENDED' ? '--' : `W${w.weekNum}`}
                  </td>
                  <td className="py-2.5 text-gray-500">{formatDate(w.date)}</td>
                  <td className="py-2.5">
                    {w.type === 'SUSPENDED' ? (
                      <Badge variant="danger">停賽</Badge>
                    ) : (
                      <Badge variant="info">{PHASE_LABEL[w.phase]}</Badge>
                    )}
                  </td>
                  <td className="py-2.5 text-gray-500">{w.venue || '-'}</td>
                  <td className="py-2.5">
                    {w.type === 'SUSPENDED' ? (
                      <span className="text-xs text-gray-400">{w.reason}</span>
                    ) : finished === total && total > 0 ? (
                      <Badge variant="success">已完成</Badge>
                    ) : total > 0 ? (
                      <Badge variant="warning">{finished}/{total}</Badge>
                    ) : (
                      <Badge>未排</Badge>
                    )}
                  </td>
                  <td className="py-2.5 text-gray-500">{w.type === 'GAME' ? total : '-'}</td>
                  <td className="py-2.5 space-x-2">
                    {w.type === 'GAME' && (
                      <Link to={`/schedule/${w.id}`} className="text-orange-500 hover:underline text-xs">
                        管理比賽
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
