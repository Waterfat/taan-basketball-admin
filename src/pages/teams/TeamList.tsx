import { Link } from 'react-router-dom';
import { useTeams } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { TeamBadge } from '../../components/TeamBadge';
import { Spinner } from '../../components/ui/Spinner';

export default function TeamList() {
  const { data: teams, isLoading } = useTeams();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">隊伍管理</h2>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">隊伍</th>
              <th className="pb-2 font-medium">代碼</th>
              <th className="pb-2 font-medium">顏色</th>
              <th className="pb-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teams?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="py-2.5"><TeamBadge team={t} /></td>
                <td className="py-2.5 text-gray-500">{t.code}</td>
                <td className="py-2.5">
                  <span className="inline-block h-5 w-5 rounded border" style={{ backgroundColor: t.color }} />
                </td>
                <td className="py-2.5">
                  <Link to={`/teams/${t.id}/edit`} className="text-orange-500 hover:underline text-xs">編輯</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
