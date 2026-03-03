import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ClipboardList, Users, UserCheck,
  Trophy, ScrollText, Megaphone, Settings, BarChart3, Repeat,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_LEVEL, type Role } from '../../types';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  minRole: Role;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: '',
    items: [
      { to: '/', label: '總覽', icon: <LayoutDashboard className="h-4 w-4" />, minRole: 'VIEWER' },
    ],
  },
  {
    title: '賽務管理',
    items: [
      { to: '/schedule', label: '賽程', icon: <Calendar className="h-4 w-4" />, minRole: 'ADMIN' },
      { to: '/boxscore', label: '數據輸入', icon: <ClipboardList className="h-4 w-4" />, minRole: 'ADMIN' },
      { to: '/attendance', label: '出席管理', icon: <UserCheck className="h-4 w-4" />, minRole: 'TEAM_CAPTAIN' },
      { to: '/rotation', label: '輪值排班', icon: <Repeat className="h-4 w-4" />, minRole: 'ADMIN' },
    ],
  },
  {
    title: '資料管理',
    items: [
      { to: '/players', label: '球員', icon: <Users className="h-4 w-4" />, minRole: 'ADMIN' },
      { to: '/teams', label: '隊伍', icon: <BarChart3 className="h-4 w-4" />, minRole: 'SUPER_ADMIN' },
      { to: '/seasons', label: '賽季', icon: <Trophy className="h-4 w-4" />, minRole: 'SUPER_ADMIN' },
      { to: '/dragon', label: '龍虎榜', icon: <ScrollText className="h-4 w-4" />, minRole: 'ADMIN' },
    ],
  },
  {
    title: '內容管理',
    items: [
      { to: '/announcements', label: '公告', icon: <Megaphone className="h-4 w-4" />, minRole: 'ADMIN' },
    ],
  },
  {
    title: '系統管理',
    items: [
      { to: '/users', label: '使用者', icon: <Settings className="h-4 w-4" />, minRole: 'SUPER_ADMIN' },
    ],
  },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const userLevel = user ? ROLE_LEVEL[user.role] : 0;

  return (
    <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-4 border-b border-gray-700">
        <h1 className="text-base font-bold text-white tracking-wide">大安聯盟後台</h1>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((i) => userLevel >= ROLE_LEVEL[i.minRole]);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title || 'root'}>
              {group.title && (
                <p className="px-2 mb-1 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  {group.title}
                </p>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-orange-500/20 text-orange-400 font-medium' : 'hover:bg-gray-800 hover:text-white',
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
