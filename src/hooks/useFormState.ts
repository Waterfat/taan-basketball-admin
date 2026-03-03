import { useState, useCallback, useRef } from 'react';

export function useFormState<T extends Record<string, unknown>>(initial: T) {
  const initialRef = useRef(initial);
  const [form, setForm] = useState(initial);
  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);
  const reset = useCallback((values?: Partial<T>) => {
    setForm(values ? { ...initialRef.current, ...values } : initialRef.current);
  }, []);
  return { form, set, setForm, reset } as const;
}
