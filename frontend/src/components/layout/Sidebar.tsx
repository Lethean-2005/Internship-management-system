import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Calendar,
  Video,
  Settings,
  ChevronUp,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth';

interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  color: string;
  roles: string[];
}

interface NavSection {
  titleKey: string;
  roles: string[];
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    titleKey: 'sidebar.management',
    roles: ['admin', 'tutor', 'intern'],
    items: [
      { to: '/', labelKey: 'sidebar.dashboard', icon: LayoutDashboard, color: '#48B6E8', roles: ['admin', 'tutor', 'intern'] },
      { to: '/my-interns', labelKey: 'sidebar.myInterns', icon: GraduationCap, color: '#22c55e', roles: ['tutor'] },
      { to: '/weekly-worklogs', labelKey: 'sidebar.weeklyWorklog', icon: ClipboardList, color: '#fb923c', roles: ['admin', 'tutor', 'intern'] },
      { to: '/final-reports', labelKey: 'sidebar.finalReport', icon: FileText, color: '#ef4444', roles: ['admin', 'tutor', 'intern'] },
      { to: '/final-slides', labelKey: 'sidebar.finalSlides', icon: Presentation, color: '#8b5cf6', roles: ['admin', 'tutor', 'intern'] },
      { to: '/company-interviews', labelKey: 'sidebar.companyInterviews', icon: CalendarCheck, color: '#0d9488', roles: ['admin', 'intern'] },
      { to: '/job-postings', labelKey: 'sidebar.jobPostings', icon: Briefcase, color: '#f59e0b', roles: ['admin', 'intern'] },
      { to: '/calendar', labelKey: 'sidebar.calendar', icon: Calendar, color: '#2563eb', roles: ['admin', 'tutor', 'intern'] },
      { to: '/mentoring-sessions', labelKey: 'sidebar.mentoringSessions', icon: Video, color: '#7c3aed', roles: ['tutor', 'intern'] },
      { to: '/take-leave', labelKey: 'sidebar.takeLeave', icon: CalendarOff, color: '#ec4899', roles: ['admin', 'tutor', 'intern'] },
    ],
  },
  {
    titleKey: 'sidebar.system',
    roles: ['admin'],
    items: [
      { to: '/users', labelKey: 'sidebar.users', icon: Users, color: '#6366f1', roles: ['admin'] },
      { to: '/roles', labelKey: 'sidebar.roles', icon: Notebook, color: '#a78bfa', roles: ['admin'] },
      { to: '/configuration', labelKey: 'sidebar.configuration', icon: Settings, color: '#64748b', roles: ['admin'] },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const roleSlug = user?.role?.slug || '';
  const filteredSections = navSections
    .filter((section) => section.roles.includes(roleSlug))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(roleSlug)),
    }))
    .filter((section) => section.items.length > 0);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearAuth();
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 h-[56px] px-4 bg-[#1a1a2e] lg:hidden">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-[5px] text-white/70 hover:bg-white/10 transition-colors">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <img src="/passerellesnum_riques_logo.jfif" alt="Logo" className="h-7 rounded-[5px] object-contain" />
        <span className="text-[0.8rem] font-semibold text-white/80 tracking-tight">IMS</span>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-[250px] bg-[#1a1a2e] transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-white/5">
          <img src="/passerellesnum_riques_logo.jfif" alt="PasserellesNum" className="h-7 rounded-[5px] object-contain" />
          <span className="text-[0.8rem] font-semibold text-white/80 tracking-tight leading-tight whitespace-pre-line">
            {t('sidebar.internshipManagement')}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-5 pb-3 space-y-5">
          {filteredSections.map((section) => (
            <div key={section.titleKey}>
              <p className="px-3 mb-3 text-[0.68rem] font-semibold text-white/30 uppercase tracking-wider">
                {t(section.titleKey)}
              </p>
              <nav className="space-y-[2px]">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-[12px] px-3 py-[8px] rounded-[5px] text-[0.85rem] font-medium transition-colors',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                      ].join(' ')
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="relative border-t border-white/5 px-3 py-3">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[5px] hover:bg-white/5 transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.75rem] font-semibold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="flex-1 text-left truncate">
              <span className="block text-[0.85rem] font-medium text-white/80 truncate">
                {user?.name || 'User'}
              </span>
              <span className="block text-[0.7rem] text-white/40 capitalize">
                {roleSlug || t('sidebar.noRole')}
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
              <NavLink
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-3 text-[0.82rem] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                {t('sidebar.profile')}
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-[0.82rem] text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5"
              >
                <LogOut className="h-4 w-4" />
                {t('sidebar.signOut')}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
