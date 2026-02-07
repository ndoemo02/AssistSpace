import {
  LayoutDashboard,
  Grid3X3,
  Link2,
  Bookmark,
  MessageSquareText,
  Lightbulb,
  Radio,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Brain,
  Radar,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import { WorkspaceSelector } from './WorkspaceSelector';

// Navigation items for Assist Space
const assistNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'moodboard', label: 'Moodboard', icon: Grid3X3 },
  { id: 'ideas', label: 'Pomysły & Notatki', icon: Lightbulb },
  { id: 'sources', label: 'Źródła', icon: Link2 },
  { id: 'saved', label: 'Zapisane', icon: Bookmark },
  { id: 'ai-chat', label: 'AI Asystent', icon: MessageSquareText },
] as const;

// Navigation items for Radar
const radarNavItems = [
  { id: 'signals', label: 'Sygnały', icon: Radio },
  { id: 'leads', label: 'Leady', icon: Users },
  { id: 'channels', label: 'Kanały', icon: Link2 },
  { id: 'outreach', label: 'Outreach', icon: Megaphone },
  { id: 'analytics', label: 'Analityka', icon: BarChart3 },
] as const;

export function Sidebar() {
  const {
    currentWorkspace,
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    assist,
    radar,
    setAssistTab,
    setRadarTab,
  } = useStore();

  const isAssist = currentWorkspace === 'assist';
  const navItems = isAssist ? assistNavItems : radarNavItems;
  const activeTab = isAssist ? assist.activeTab : radar.activeTab;
  const setActiveTab = isAssist ? setAssistTab : setRadarTab;
  const itemCount = isAssist
    ? assist.knowledgeItems.filter((l) => l.isFavorite).length
    : radar.leads.filter((l) => l.status === 'qualified' || l.status === 'outreach_ready').length;

  const accentGradient = isAssist
    ? 'from-violet-500 to-indigo-600'
    : 'from-emerald-500 to-teal-600';

  const accentShadow = isAssist ? 'shadow-violet-200' : 'shadow-emerald-200';
  const accentBg = isAssist ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600';

  const handleNavClick = (id: string) => {
    setActiveTab(id as never);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
              accentGradient,
              accentShadow
            )}
          >
            {isAssist ? (
              <Brain className="h-4 w-4 text-white" />
            ) : (
              <Radar className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">
              {isAssist ? 'Assist Space' : 'FlowAssist Radar'}
            </h1>
            <p className="text-xs text-slate-500">
              {isAssist ? 'Personal Intelligence' : 'Market Intelligence'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-all duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isSidebarCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Workspace Selector */}
          <div
            className={cn(
              'border-b border-slate-200 p-4',
              isSidebarCollapsed && 'lg:flex lg:justify-center lg:p-3'
            )}
          >
            <div className={cn(isSidebarCollapsed && 'lg:hidden')}>
              <WorkspaceSelector />
            </div>
            <div className={cn('hidden', isSidebarCollapsed && 'lg:block')}>
              <WorkspaceSelector collapsed />
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <div
              className={cn(
                'mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400',
                isSidebarCollapsed && 'lg:hidden'
              )}
            >
              {isAssist ? 'Nawigacja' : 'Market Intel'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isSidebarCollapsed && 'lg:justify-center lg:px-3',
                    isActive
                      ? cn('bg-gradient-to-r text-white shadow-lg', accentGradient, accentShadow)
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                      isActive
                        ? 'text-white'
                        : isAssist
                        ? 'text-slate-400 group-hover:text-violet-500'
                        : 'text-slate-400 group-hover:text-emerald-500'
                    )}
                  />
                  <span
                    className={cn(
                      'transition-all duration-300',
                      isSidebarCollapsed ? 'lg:hidden lg:w-0 lg:opacity-0' : 'opacity-100'
                    )}
                  >
                    {item.label}
                  </span>
                  {((isAssist && item.id === 'saved') || (!isAssist && item.id === 'leads')) &&
                    itemCount > 0 &&
                    !isSidebarCollapsed && (
                      <span
                        className={cn(
                          'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                          isActive ? 'bg-white/20 text-white' : accentBg
                        )}
                      >
                        {itemCount}
                      </span>
                    )}
                </button>
              );
            })}
          </nav>

          {/* Stats - Hidden when collapsed */}
          <div
            className={cn(
              'border-t border-slate-200 p-4 transition-all duration-300',
              isSidebarCollapsed && 'lg:hidden'
            )}
          >
            <div
              className={cn(
                'rounded-xl p-4',
                isAssist
                  ? 'bg-gradient-to-br from-violet-50 to-indigo-50'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50'
              )}
            >
              <p className="text-xs font-medium text-slate-500">
                {isAssist ? 'Twoja wiedza' : 'Pipeline'}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {isAssist ? (
                  <>
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <p className="text-lg font-bold text-slate-900">
                        {assist.knowledgeItems.length}
                      </p>
                      <p className="text-xs text-slate-500">Elementów</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <p className="text-lg font-bold text-violet-600">{assist.ideas.length}</p>
                      <p className="text-xs text-slate-500">Pomysłów</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <p className="text-lg font-bold text-slate-900">{radar.leads.length}</p>
                      <p className="text-xs text-slate-500">Leadów</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <p className="text-lg font-bold text-emerald-600">{radar.signals.length}</p>
                      <p className="text-xs text-slate-500">Sygnałów</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Collapse Button (Desktop only) */}
          <div className="hidden border-t border-slate-200 p-3 lg:block">
            <button
              onClick={toggleSidebarCollapsed}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100',
                isSidebarCollapsed && 'justify-center px-3'
              )}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-slate-400" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 text-slate-400" />
                  <span>Zwiń panel</span>
                </>
              )}
            </button>
          </div>

          {/* Settings */}
          <div className="border-t border-slate-200 p-3">
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100',
                isSidebarCollapsed && 'lg:justify-center lg:px-3'
              )}
              title={isSidebarCollapsed ? 'Ustawienia' : undefined}
            >
              <Settings className="h-5 w-5 shrink-0 text-slate-400" />
              <span
                className={cn(
                  'transition-all duration-300',
                  isSidebarCollapsed ? 'lg:hidden lg:w-0 lg:opacity-0' : 'opacity-100'
                )}
              >
                Ustawienia
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
