import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, useCreateUser, useUpdateUser } from '../../hooks/useApi';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import type { Role } from '../../types';

const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM_CAPTAIN', 'PLAYER', 'VIEWER'];

export default function UserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(Number(id));
  const create = useCreateUser();
  const update = useUpdateUser();

  const [form, setForm] = useState({ username: '', password: '', displayName: '', role: 'VIEWER' as Role });

  useEffect(() => {
    if (user) setForm({ username: user.username, password: '', displayName: user.displayName, role: user.role });
  }, [user]);

  if (isEdit && isLoading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const data: Record<string, unknown> = { displayName: form.displayName, role: form.role };
        if (form.password) data.password = form.password;
        await update.mutateAsync({ id: Number(id), ...data });
        toast.success('使用者已更新');
      } else {
        await create.mutateAsync(form);
        toast.success('使用者已建立');
      }
      navigate('/users');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{isEdit ? '編輯使用者' : '新增使用者'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="帳號" required value={form.username} onChange={(e) => set('username', (e.target as HTMLInputElement).value)} disabled={isEdit} />
          <FormField
            label={isEdit ? '新密碼（留空不更改）' : '密碼'}
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => set('password', (e.target as HTMLInputElement).value)}
          />
          <FormField label="顯示名稱" required value={form.displayName} onChange={(e) => set('displayName', (e.target as HTMLInputElement).value)} />
          <FormField label="角色" as="select" value={form.role} onChange={(e) => set('role', (e.target as HTMLSelectElement).value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending || update.isPending}>儲存</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>取消</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
