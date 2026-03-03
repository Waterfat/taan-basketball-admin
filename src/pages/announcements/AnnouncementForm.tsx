import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useApi';
import { useFormState } from '../../hooks/useFormState';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export default function AnnouncementForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const formSubmit = useFormSubmit();
  const { data: item, isLoading } = useAnnouncement(Number(id));
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();

  const { form, set, setForm } = useFormState({ title: '', content: '', isPinned: false });

  useEffect(() => {
    if (item) setForm({ title: item.title, content: item.content, isPinned: item.isPinned });
  }, [item]);

  if (isEdit && isLoading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await formSubmit(() => update.mutateAsync({ id: Number(id), ...form }), { success: '公告已更新', redirect: '/announcements' });
    } else {
      await formSubmit(() => create.mutateAsync(form), { success: '公告已建立', redirect: '/announcements' });
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{isEdit ? '編輯公告' : '新增公告'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="標題" required value={form.title} onChange={(e) => set('title', (e.target as HTMLInputElement).value)} />
          <FormField label="內容" as="textarea" required value={form.content} onChange={(e) => set('content', (e.target as HTMLTextAreaElement).value)} className="min-h-[160px]" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => set('isPinned', e.target.checked)} className="rounded" />
            置頂
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending || update.isPending}>儲存</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/announcements')}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
