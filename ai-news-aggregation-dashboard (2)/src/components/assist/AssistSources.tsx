import { useState } from 'react';
import { Plus, Youtube, Github, Rss, Globe, Trash2, Power, ExternalLink, Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { AssistPersonal } from '@/types';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0z" />
  </svg>
);

const sourceTypes = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500 bg-red-50' },
  { id: 'reddit', label: 'Reddit', icon: () => <RedditIcon />, color: 'text-orange-500 bg-orange-50' },
  { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-900 bg-slate-100' },
  { id: 'rss', label: 'RSS Feed', icon: Rss, color: 'text-amber-500 bg-amber-50' },
  { id: 'custom', label: 'Custom', icon: Globe, color: 'text-violet-500 bg-violet-50' },
] as const;

export function AssistSources() {
  const { assist, addSource, updateSource, deleteSource } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'youtube' as AssistPersonal.Source['type'],
  });

  const handleAddSource = () => {
    if (!newSource.name.trim() || !newSource.url.trim()) return;
    addSource({ ...newSource, isActive: true });
    setNewSource({ name: '', url: '', type: 'youtube' });
    setIsAdding(false);
  };

  const filteredSources = assist.sources.filter(
    (source) =>
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceIcon = (type: AssistPersonal.Source['type']) => {
    const sourceType = sourceTypes.find((s) => s.id === type);
    return sourceType?.icon || Globe;
  };

  const getSourceColor = (type: AssistPersonal.Source['type']) => {
    const sourceType = sourceTypes.find((s) => s.id === type);
    return sourceType?.color || 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Źródła Wiedzy</h1>
          <p className="text-sm text-slate-500 sm:text-base">Zarządzaj źródłami do monitorowania</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          Dodaj źródło
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj źródeł..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:py-3 sm:pl-12"
        />
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Dodaj nowe źródło</h3>
              <button onClick={() => setIsAdding(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nazwa</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="np. AI Explained"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">URL</label>
                <input
                  type="url"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Typ</label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value as AssistPersonal.Source['type'] })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                >
                  {sourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Anuluj
              </button>
              <button
                onClick={handleAddSource}
                disabled={!newSource.name.trim() || !newSource.url.trim()}
                className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {sourceTypes.map((sourceType) => {
        const typeSources = filteredSources.filter((s) => s.type === sourceType.id);
        if (typeSources.length === 0) return null;
        const Icon = sourceType.icon;

        return (
          <div key={sourceType.id} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn('rounded-lg p-1.5 sm:p-2', sourceType.color)}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{sourceType.label}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{typeSources.length}</span>
            </div>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {typeSources.map((source) => {
                const SourceIcon = getSourceIcon(source.type);
                return (
                  <div
                    key={source.id}
                    className={cn(
                      'group rounded-xl border bg-white p-3 transition-all sm:rounded-2xl sm:p-4',
                      source.isActive ? 'border-slate-200 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100' : 'border-slate-100 bg-slate-50 opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn('shrink-0 rounded-lg p-2 sm:rounded-xl sm:p-2.5', getSourceColor(source.type))}>
                        <SourceIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{source.name}</h3>
                        <p className="truncate text-xs text-slate-500 sm:text-sm">{source.url}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between sm:mt-3">
                      <button
                        onClick={() => updateSource(source.id, { isActive: !source.isActive })}
                        className={cn(
                          'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all',
                          source.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        )}
                      >
                        <Power className="h-3 w-3" />
                        {source.isActive ? 'Aktywne' : 'Nieaktywne'}
                      </button>
                      <div className="flex items-center gap-1">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </a>
                        <button onClick={() => deleteSource(source.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredSources.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Globe className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak źródeł</h3>
          <p className="mt-1 text-sm text-slate-500">Dodaj swoje pierwsze źródło</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
            <Plus className="h-4 w-4" />
            Dodaj źródło
          </button>
        </div>
      )}
    </div>
  );
}
