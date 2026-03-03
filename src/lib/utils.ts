import { type ClassValue, clsx } from 'clsx';
import type { Week } from '../types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

export function formatPct(pct: number): string {
  return pct.toFixed(3).replace(/^0/, '');
}

export function filterGameWeeks(weeks: Week[] | undefined, descending = true) {
  return (weeks?.filter((w) => w.type === 'GAME') ?? [])
    .sort((a, b) => descending ? b.weekNum - a.weekNum : a.weekNum - b.weekNum);
}
