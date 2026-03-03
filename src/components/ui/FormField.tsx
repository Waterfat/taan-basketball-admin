import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
}

type InputFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type SelectFieldProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; children: ReactNode };
type TextareaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type FormFieldProps = InputFieldProps | SelectFieldProps | TextareaFieldProps;

const baseCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors';

export function FormField(props: FormFieldProps) {
  const { label, error, required, as = 'input', className, ...rest } = props as any;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {as === 'select' ? (
        <select className={cn(baseCls, error && 'border-red-400', className)} {...rest} />
      ) : as === 'textarea' ? (
        <textarea className={cn(baseCls, 'min-h-[80px]', error && 'border-red-400', className)} {...rest} />
      ) : (
        <input className={cn(baseCls, error && 'border-red-400', className)} {...rest} />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
