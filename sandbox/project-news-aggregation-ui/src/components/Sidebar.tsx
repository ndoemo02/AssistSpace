import { LayoutDashboard, Newspaper, Lightbulb, PlusCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  activeTab: 'dashboard' | 'news' | 'brainstorm';
  setActiveTab: (tab: 'dashboard' | 'news' | 'brainstorm') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Projects', icon: LayoutDashboard },
    { id: 'news', label: 'AI Updates', icon: Newspaper },
    { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb },
  ] as const;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-900">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
          <span className="text-white font-bold">N</span>
        </div>
        <span className="text-lg font-bold tracking-tight">Nexus AI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <button className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>
    </div>
  );
}
