import { TEAM_COLORS } from '../lib/constants';
import type { Team } from '../types';

interface TeamBadgeProps {
  team: Pick<Team, 'code' | 'shortName'>;
  size?: 'sm' | 'md';
}

export function TeamBadge({ team, size = 'md' }: TeamBadgeProps) {
  const c = TEAM_COLORS[team.code] ?? { bg: '#999', text: '#fff' };
  const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dotSize} rounded-full inline-block flex-shrink-0`} style={{ backgroundColor: c.bg }} />
      <span className={`font-medium ${textSize}`}>{team.shortName}隊</span>
    </span>
  );
}
