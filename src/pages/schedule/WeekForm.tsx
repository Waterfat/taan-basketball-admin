import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWeek, useSeasons } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import type { Phase, WeekType } from '../../types';

export default function WeekForm() {
  const navigate = useNavigate();
  const { data: seasons } = useSeasons();
  const current = seasons?.find((s) => s.isCurrent);
  const create = useCreateWeek();

  const [form, setForm] = useState({
    weekNum: '', date: '', phase: 'REGULAR' as Phase, venue: '', type: 'GAME' as WeekType, reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    try {
      await create.mutateAsync({
        seasonId: current.id,
        weekNum: Number(form.weekNum),
        date: form.date,
        phase: form.phase,
        venue: form.venue,
        type: form.type,
        reason: form.reason || undefined,
      });
      toast.success('週次已建立');
      navigate('/schedule');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">新增週次</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="類型" as="select" value={form.type} onChange={(e) => set('type', (e.target as HTMLSelectElement).value)}>
            <option value="GAME">比賽日</option>
            <option value="SUSPENDED">停賽</option>
          </FormField>
          {form.type === 'GAME' && (
            <FormField label="週次" type="number" required value={form.weekNum} onChange={(e) => set('weekNum', (e.target as HTMLInputElement).value)} />
          )}
          <FormField label="日期" type="date" required value={form.date} onChange={(e) => set('date', (e.target as HTMLInputElement).value)} />
          {form.type === 'GAME' && (
            <>
              <FormField label="賽制" as="select" value={form.phase} onChange={(e) => set('phase', (e.target as HTMLSelectElement).value)}>
                <option value="PRESEASON">熱身賽</option>
                <option value="REGULAR">例行賽</option>
                <option value="PLAYOFF">季後賽</option>
              </FormField>
              <FormField label="場地" value={form.venue} onChange={(e) => set('venue', (e.target as HTMLInputElement).value)} />
            </>
          )}
          {form.type === 'SUSPENDED' && (
            <FormField label="原因" value={form.reason} onChange={(e) => set('reason', (e.target as HTMLInputElement).value)} placeholder="例：過年" />
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending}>建立</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/schedule')}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
