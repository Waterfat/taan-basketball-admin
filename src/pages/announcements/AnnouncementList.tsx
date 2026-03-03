import { Link } from 'react-router-dom';
import { useAnnouncements, useDeleteAnnouncement } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import { Plus, Pin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementList() {
  const { data: items, isLoading } = useAnnouncements();
  const remove = useDeleteAnnouncement();

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除？')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('已刪除');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失敗');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">公告管理</h2>
        <Link to="/announcements/new">
          <Button size="sm"><Plus className="h-4 w-4" /> 新增公告</Button>
        </Link>
      </div>
      <Card>
        <div className="divide-y">
          {items?.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  {a.isPinned && <Pin className="h-3.5 w-3.5 text-orange-500" />}
                  <span className="font-medium">{a.title}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.publishedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/announcements/${a.id}/edit`} className="text-orange-500 hover:underline text-xs">
                  編輯
                </Link>
                <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {(!items || items.length === 0) && <p className="py-4 text-center text-gray-400">尚無公告</p>}
        </div>
      </Card>
    </div>
  );
}
