import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Notebook,
  GraduationCap,
  ClipboardList,
  FileText,
  Presentation,
  MessageSquare,
  CalendarCheck,
  Briefcase,
  CalendarOff,
  ChevronUp,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/roles', label: 'Roles', icon: Notebook, roles: ['admin'] },
  { to: '/my-interns', label: 'My Interns', icon: GraduationCap, roles: ['tutor'] },
  { to: '/weekly-worklogs', label: 'Weekly Worklog', icon: ClipboardList, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
  { to: '/final-reports', label: 'Final Report', icon: FileText, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
  { to: '/final-slides', label: 'Final Slides', icon: Presentation, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
  { to: '/contact-supervisor', label: 'Contact Supervisor', icon: MessageSquare, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
  { to: '/company-interviews', label: 'Company Interviews', icon: CalendarCheck, roles: ['admin', 'supervisor', 'intern'] },
  { to: '/job-postings', label: 'Job Postings', icon: Briefcase, roles: ['admin', 'intern'] },
  { to: '/take-leave', label: 'Take Leave', icon: CalendarOff, roles: ['admin', 'tutor', 'supervisor', 'intern'] },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleSlug = user?.role?.slug || '';

  const filteredNavItems = navItems.filter((item) => item.roles.includes(roleSlug));

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    clearAuth();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-[250px] bg-[#1a1a2e]">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-white/5">
        <img src="/passerellesnum_riques_logo.jfif" alt="PasserellesNum" className="h-7 rounded-[5px] object-contain" />
        <span className="text-[0.8rem] font-semibold text-white/80 tracking-tight leading-tight">
          Internship<br />Management
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pt-5 pb-3">
        <p className="px-3 mb-3 text-[0.68rem] font-semibold text-white/30 uppercase tracking-wider">
          Navigations
        </p>
        <nav className="space-y-[2px]">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-[12px] px-3 py-[10px] rounded-[5px] text-[0.88rem] font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom user section */}
      <div className="relative border-t border-white/5 px-3 py-3">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[5px] hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.75rem] font-semibold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 text-left truncate">
            <span className="block text-[0.85rem] font-medium text-white/80 truncate">
              {user?.name || 'User'}
            </span>
            <span className="block text-[0.7rem] text-white/40 capitalize">
              {roleSlug || 'No role'}
            </span>
          </div>
          {dropdownOpen ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#16213e] border border-white/10 rounded-[5px] overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-[0.82rem] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
