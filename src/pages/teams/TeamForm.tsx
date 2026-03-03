import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeam, useUpdateTeam } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';

export default function TeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(Number(id));
  const update = useUpdateTeam();

  const [form, setForm] = useState({ name: '', shortName: '', color: '#000000', barColor: '', textColor: '#ffffff' });

  useEffect(() => {
    if (team) setForm({ name: team.name, shortName: team.shortName, color: team.color, barColor: team.barColor ?? '', textColor: team.textColor ?? '#ffffff' });
  }, [team]);

  if (isLoading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ id: Number(id), ...form });
      toast.success('隊伍已更新');
      navigate('/teams');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">編輯隊伍</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="隊名" required value={form.name} onChange={(e) => set('name', (e.target as HTMLInputElement).value)} />
          <FormField label="簡稱" required value={form.shortName} onChange={(e) => set('shortName', (e.target as HTMLInputElement).value)} />
          <FormField label="顏色" type="color" value={form.color} onChange={(e) => set('color', (e.target as HTMLInputElement).value)} />
          <FormField label="長條色" type="color" value={form.barColor || form.color} onChange={(e) => set('barColor', (e.target as HTMLInputElement).value)} />
          <FormField label="文字色" type="color" value={form.textColor} onChange={(e) => set('textColor', (e.target as HTMLInputElement).value)} />
          <div className="flex gap-2">
            <Button type="submit" loading={update.isPending}>儲存</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/teams')}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
