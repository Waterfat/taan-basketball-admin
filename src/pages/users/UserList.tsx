import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_BADGE: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  SUPER_ADMIN: 'danger',
  ADMIN: 'warning',
  TEAM_CAPTAIN: 'info',
  PLAYER: 'default',
  VIEWER: 'default',
};

export default function UserList() {
  const { data: users, isLoading } = useUsers();
  const remove = useDeleteUser();

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除此使用者？')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('使用者已刪除');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失敗');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">使用者管理</h2>
        <Link to="/users/new">
          <Button size="sm"><Plus className="h-4 w-4" /> 新增使用者</Button>
        </Link>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">帳號</th>
              <th className="pb-2 font-medium">顯示名稱</th>
              <th className="pb-2 font-medium">角色</th>
              <th className="pb-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="py-2.5 font-medium">{u.username}</td>
                <td className="py-2.5">{u.displayName}</td>
                <td className="py-2.5">
                  <Badge variant={ROLE_BADGE[u.role] ?? 'default'}>{u.role}</Badge>
                </td>
                <td className="py-2.5 space-x-2">
                  <Link to={`/users/${u.id}/edit`} className="text-orange-500 hover:underline text-xs">編輯</Link>
                  <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
