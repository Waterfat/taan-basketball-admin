import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeason, useCreateSeason, useUpdateSeason } from '../../hooks/useApi';
import { useFormState } from '../../hooks/useFormState';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export default function SeasonForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const formSubmit = useFormSubmit();
  const { data: season, isLoading } = useSeason(Number(id));
  const create = useCreateSeason();
  const update = useUpdateSeason();

  const { form, set, setForm } = useFormState({ number: '', name: '', startDate: '', isCurrent: false });

  useEffect(() => {
    if (season) {
      setForm({
        number: String(season.number),
        name: season.name ?? '',
        startDate: season.startDate ? season.startDate.slice(0, 10) : '',
        isCurrent: season.isCurrent,
      });
    }
  }, [season]);

  if (isEdit && isLoading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      number: Number(form.number),
      name: form.name || undefined,
      startDate: form.startDate || undefined,
      isCurrent: form.isCurrent,
    };
    if (isEdit) {
      await formSubmit(() => update.mutateAsync({ id: Number(id), ...data }), { success: '賽季已更新', redirect: '/seasons' });
    } else {
      await formSubmit(() => create.mutateAsync(data), { success: '賽季已建立', redirect: '/seasons' });
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{isEdit ? '編輯賽季' : '新增賽季'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="屆數" type="number" required value={form.number} onChange={(e) => set('number', (e.target as HTMLInputElement).value)} />
          <FormField label="名稱" value={form.name} onChange={(e) => set('name', (e.target as HTMLInputElement).value)} placeholder="第 25 屆" />
          <FormField label="開始日期" type="date" value={form.startDate} onChange={(e) => set('startDate', (e.target as HTMLInputElement).value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isCurrent} onChange={(e) => set('isCurrent', e.target.checked)} className="rounded" />
            目前進行中
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending || update.isPending}>儲存</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/seasons')}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
