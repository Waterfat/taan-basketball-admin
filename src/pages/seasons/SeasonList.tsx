import { Link } from 'react-router-dom';
import { useSeasons } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import { Plus } from 'lucide-react';

export default function SeasonList() {
  const { data: seasons, isLoading } = useSeasons();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">賽季管理</h2>
        <Link to="/seasons/new">
          <Button size="sm"><Plus className="h-4 w-4" /> 新增賽季</Button>
        </Link>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">屆數</th>
              <th className="pb-2 font-medium">名稱</th>
              <th className="pb-2 font-medium">開始日期</th>
              <th className="pb-2 font-medium">狀態</th>
              <th className="pb-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {seasons?.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="py-2.5 font-medium">{s.number}</td>
                <td className="py-2.5">{s.name ?? '-'}</td>
                <td className="py-2.5 text-gray-500">{s.startDate ? formatDate(s.startDate) : '-'}</td>
                <td className="py-2.5">
                  {s.isCurrent ? <Badge variant="success">進行中</Badge> : <Badge>已結束</Badge>}
                </td>
                <td className="py-2.5">
                  <Link to={`/seasons/${s.id}/edit`} className="text-orange-500 hover:underline text-xs">
                    編輯
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
