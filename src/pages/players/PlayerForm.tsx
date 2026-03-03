import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayer, useCreatePlayer, useUpdatePlayer, useDeletePlayer, useTeams, useSeasons } from '../../hooks/useApi';
import { useFormState } from '../../hooks/useFormState';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';

export default function PlayerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: ps, isLoading } = usePlayer(Number(id));
  const { data: teams } = useTeams();
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const create = useCreatePlayer();
  const update = useUpdatePlayer();
  const remove = useDeletePlayer();

  const { form, set, setForm } = useFormState({
    name: '', teamId: '', jerseyNumber: '', isCaptain: false, isReferee: false, phone: '',
  });

  useEffect(() => {
    if (ps) {
      setForm({
        name: ps.player.name,
        teamId: ps.teamSeason?.team ? String(ps.teamSeason.team.id) : '',
        jerseyNumber: ps.jerseyNumber != null ? String(ps.jerseyNumber) : '',
        isCaptain: ps.isCaptain,
        isReferee: ps.player.isReferee,
        phone: ps.player.phone ?? '',
      });
    }
  }, [ps]);

  if (isEdit && isLoading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await update.mutateAsync({
          playerId: ps!.player.id,
          name: form.name,
          phone: form.phone || undefined,
          isReferee: form.isReferee,
          teamSeasonId: ps?.teamSeasonId || undefined,
          jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
          isCaptain: form.isCaptain,
        });
        toast.success('球員已更新');
      } else {
        if (!current) { toast.error('找不到目前賽季'); return; }
        await create.mutateAsync({
          name: form.name,
          teamId: Number(form.teamId),
          seasonId: current.id,
          jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
          isCaptain: form.isCaptain,
          isReferee: form.isReferee,
          phone: form.phone || undefined,
        });
        toast.success('球員已建立');
      }
      navigate('/players');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除此球員？')) return;
    try {
      await remove.mutateAsync(ps!.player.id);
      toast.success('球員已刪除');
      navigate('/players');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{isEdit ? '編輯球員' : '新增球員'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="姓名" required value={form.name} onChange={(e) => set('name', (e.target as HTMLInputElement).value)} />
          <FormField label="所屬隊伍" as="select" required value={form.teamId} onChange={(e) => set('teamId', (e.target as HTMLSelectElement).value)}>
            <option value="">選擇隊伍</option>
            {teams?.map((t) => (
              <option key={t.id} value={t.id}>{t.shortName}隊</option>
            ))}
          </FormField>
          <FormField label="背號" type="number" value={form.jerseyNumber} onChange={(e) => set('jerseyNumber', (e.target as HTMLInputElement).value)} />
          <FormField label="電話" value={form.phone} onChange={(e) => set('phone', (e.target as HTMLInputElement).value)} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isCaptain} onChange={(e) => set('isCaptain', e.target.checked)} className="rounded" />
              隊長
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isReferee} onChange={(e) => set('isReferee', e.target.checked)} className="rounded" />
              裁判
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending || update.isPending}>儲存</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/players')}>取消</Button>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete} loading={remove.isPending}>刪除</Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
