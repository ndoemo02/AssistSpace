import { useState } from 'react';
import { Star, Search, Filter, ExternalLink, Trash2, Youtube, Github, Clock, Tag, Sparkles, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { AssistPersonal } from '@/types';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0z" />
  </svg>
);

const categoryFilters: { id: AssistPersonal.Category | 'all' | 'favorites'; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'favorites', label: 'Ulubione' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'github', label: 'GitHub' },
  { id: 'articles', label: 'Artykuły' },
  { id: 'tools', label: 'Narzędzia' },
  { id: 'research', label: 'Research' },
];

export function AssistSaved() {
  const { assist, toggleFavorite, deleteKnowledgeItem, setAssistTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AssistPersonal.Category | 'all' | 'favorites'>('all');
  const [selectedItem, setSelectedItem] = useState<AssistPersonal.KnowledgeItem | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredItems = assist.knowledgeItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'favorites') return matchesSearch && item.isFavorite;
    return matchesSearch && item.category === selectedFilter;
  });

  const getSourceIcon = (source: AssistPersonal.KnowledgeItem['source']) => {
    switch (source) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'reddit': return <div className="text-orange-500"><RedditIcon /></div>;
      case 'github': return <Github className="h-4 w-4 text-slate-900" />;
      default: return <ExternalLink className="h-4 w-4 text-slate-400" />;
    }
  };

  const currentFilterLabel = categoryFilters.find((f) => f.id === selectedFilter)?.label || 'Wszystkie';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Zapisana Wiedza</h1>
        <p className="text-sm text-slate-500 sm:text-base">Twoja kolekcja zasobów AI</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:py-3 sm:pl-12"
          />
        </div>

        <div className="relative sm:hidden">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {currentFilterLabel}
            </div>
            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', showFilterDropdown && 'rotate-180')} />
          </button>
          {showFilterDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                {categoryFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => { setSelectedFilter(filter.id); setShowFilterDropdown(false); }}
                    className={cn('w-full px-4 py-2 text-left text-sm', selectedFilter === filter.id ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50')}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 overflow-x-auto pb-2 sm:flex sm:pb-0">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {categoryFilters.slice(0, 6).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={cn('shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all', selectedFilter === filter.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="group rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 sm:rounded-2xl sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getSourceIcon(item.source)}
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.category}</span>
              </div>
              <button onClick={() => toggleFavorite(item.id)} className={cn('rounded-lg p-1.5 transition-all', item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500')}>
                <Star className={cn('h-4 w-4', item.isFavorite && 'fill-current')} />
              </button>
            </div>
            <h3 className="mt-2 cursor-pointer text-sm font-semibold text-slate-900 line-clamp-2 hover:text-violet-600 sm:mt-3 sm:text-base" onClick={() => setSelectedItem(item)}>
              {item.title}
            </h3>
            {item.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2 sm:text-sm">{item.description}</p>}
            <div className="mt-2 flex flex-wrap gap-1 sm:mt-3">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 sm:mt-3 sm:pt-3">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(item.addedAt).toLocaleDateString('pl-PL')}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setAssistTab('ai-chat')} className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-violet-100 hover:text-violet-600" title="Zapytaj AI">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600">
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <button onClick={() => deleteKnowledgeItem(item.id)} className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-100 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Star className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak zapisanych elementów</h3>
          <p className="mt-1 text-center text-sm text-slate-500">{searchQuery ? 'Brak wyników wyszukiwania' : 'Dodaj elementy z Dashboardu lub Moodboardu'}</p>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => setSelectedItem(null)}>
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {getSourceIcon(selectedItem.source)}
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{selectedItem.category}</span>
              <button onClick={() => toggleFavorite(selectedItem.id)} className={cn('ml-auto rounded-lg p-1.5', selectedItem.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500')}>
                <Star className={cn('h-5 w-5', selectedItem.isFavorite && 'fill-current')} />
              </button>
              <button onClick={() => setSelectedItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 sm:mt-4 sm:text-xl">{selectedItem.title}</h2>
            {selectedItem.description && <p className="mt-2 text-sm text-slate-600">{selectedItem.description}</p>}
            <div className="mt-3 sm:mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">URL</label>
              <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-violet-600 hover:underline sm:text-sm">
                <span className="truncate">{selectedItem.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div className="mt-3 sm:mt-4">
              <label className="mb-2 block text-xs font-medium text-slate-700">Tagi</label>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-600 sm:px-3 sm:text-sm">
                    <Tag className="h-3 w-3" />{tag}
                  </span>
                ))}
              </div>
            </div>
            {selectedItem.summary && (
              <div className="mt-3 rounded-xl bg-violet-50 p-3 sm:mt-4 sm:p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-700 sm:text-sm">
                  <Sparkles className="h-4 w-4" />Podsumowanie AI
                </div>
                <p className="text-xs text-slate-700 sm:text-sm">{selectedItem.summary}</p>
              </div>
            )}
            <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
              <button onClick={() => { setSelectedItem(null); setAssistTab('ai-chat'); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:shadow-xl sm:py-3">
                <Sparkles className="h-4 w-4" />Zapytaj AI
              </button>
              <button onClick={() => setSelectedItem(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:py-3">
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
