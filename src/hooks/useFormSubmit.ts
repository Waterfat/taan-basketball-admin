import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useFormSubmit() {
  const navigate = useNavigate();

  const submit = async (
    fn: () => Promise<unknown>,
    opts: { success: string; redirect?: string },
  ) => {
    try {
      await fn();
      toast.success(opts.success);
      if (opts.redirect) navigate(opts.redirect);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失敗');
    }
  };

  return submit;
}
