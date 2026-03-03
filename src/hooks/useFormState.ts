import { useState, useCallback } from 'react';

export function useFormState<T extends Record<string, any>>(initial: T) {
  const [form, setForm] = useState(initial);
  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);
  const reset = useCallback((values?: Partial<T>) => {
    setForm(values ? { ...initial, ...values } : initial);
  }, [initial]);
  return { form, set, setForm, reset } as const;
}
