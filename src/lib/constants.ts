export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const TEAM_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  red:    { bg: '#e53935', text: '#ffffff', bar: '#e53935' },
  black:  { bg: '#212121', text: '#ffffff', bar: '#212121' },
  blue:   { bg: '#1e88e5', text: '#ffffff', bar: '#1e88e5' },
  green:  { bg: '#43a047', text: '#ffffff', bar: '#43a047' },
  yellow: { bg: '#fdd835', text: '#000000', bar: '#fdd835' },
  white:  { bg: '#f5f5f5', text: '#000000', bar: '#bdbdbd' },
};
