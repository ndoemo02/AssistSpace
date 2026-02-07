import { Brain, Radar, ChevronDown, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { Workspace } from '@/types';

const workspaces: { id: Workspace; name: string; subtitle: string; icon: React.ElementType; color: string; gradient: string }[] = [
  {
    id: 'assist',
    name: 'Assist Space',
    subtitle: 'Personal Intelligence OS',
    icon: Brain,
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-indigo-600',
  },
  {
    id: 'radar',
    name: 'FlowAssist Radar',
    subtitle: 'Market Intelligence OS',
    icon: Radar,
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

interface WorkspaceSelectorProps {
  collapsed?: boolean;
}

export function WorkspaceSelector({ collapsed }: WorkspaceSelectorProps) {
  const { currentWorkspace, setWorkspace } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const current = workspaces.find((w) => w.id === currentWorkspace)!;
  const CurrentIcon = current.icon;

  if (collapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all hover:scale-105',
            current.gradient
          )}
          title={current.name}
        >
          <CurrentIcon className="h-5 w-5 text-white" />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute left-12 top-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
              {workspaces.map((workspace) => {
                const Icon = workspace.icon;
                const isActive = workspace.id === currentWorkspace;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setWorkspace(workspace.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-3 transition-all',
                      isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', workspace.gradient)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900">{workspace.name}</p>
                      <p className="text-xs text-slate-500">{workspace.subtitle}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
              
              {/* Data Separation Notice */}
              <div className="mt-2 border-t border-slate-100 pt-2">
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2">
                  <Shield className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                  <p className="text-xs text-amber-700">
                    Dane są całkowicie odseparowane między przestrzeniami
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 transition-all hover:border-slate-300 hover:bg-white"
      >
        <div className={cn('rounded-xl bg-gradient-to-br p-2.5 shadow-lg', current.gradient)}>
          <CurrentIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-slate-900">{current.name}</p>
          <p className="text-xs text-slate-500">{current.subtitle}</p>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;
              const isActive = workspace.id === currentWorkspace;
              return (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setWorkspace(workspace.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-3 transition-all',
                    isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                  )}
                >
                  <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', workspace.gradient)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-slate-900">{workspace.name}</p>
                    <p className="text-xs text-slate-500">{workspace.subtitle}</p>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-emerald-600">Aktywna</span>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Future Expansion Teaser */}
            <div className="mt-2 border-t border-slate-100 pt-2">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 opacity-50">
                <div className="rounded-lg bg-slate-300 p-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-400">FlowAssist Ops</p>
                  <p className="text-xs text-slate-400">Wkrótce dostępne</p>
                </div>
              </div>
            </div>

            {/* Data Separation Notice */}
            <div className="mt-2 border-t border-slate-100 pt-2">
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Separacja danych</p>
                  <p className="text-xs text-amber-700">
                    Osobiste notatki w Assist Space nigdy nie mieszają się z danymi biznesowymi w Radar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
