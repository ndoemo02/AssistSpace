import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  Youtube,
  MessageSquare,
  CheckCircle2,
  Inbox,
  X,
  Search,
  PanelLeft,
  Trash2,
  Settings,
  BrainCircuit,
  Flame,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NewsCard } from './components/NewsCard';
import { AddGlobalItem } from './components/AddGlobalItem';

interface NewsItem {
  id: string;
  source_platform: string;
  title: string;
  url: string;
  published_at: string;
  summary_points: string[];
  category: string;
  author_or_channel: string;
  status: 'inbox' | 'reviewed' | 'done' | 'trash';
  raw_content?: string;
}

interface Source {
  id: string;
  platform: 'youtube' | 'reddit';
  identifier: string;
  name: string;
}

const getSubreddit = (url: string) => {
  try {
    if (url.includes('reddit.com/r/')) {
      return `r/${url.split('/r/')[1].split('/')[0]}`;
    }
  } catch {
    return null;
  }
  return null;
};

const KanbanColumn = ({
  id,
  title,
  icon: Icon,
  items,
  expandedId,
  setExpandedId,
  onUpdate,
}: any) => {
  const { setNodeRef } = useDroppable({ id, data: { type: 'column' } });

  return (
    <section
      ref={setNodeRef}
      className="flex-1 min-w-[300px] md:min-w-[350px] max-w-[420px] h-full flex flex-col rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl"
    >
      <header className="p-4 flex items-center gap-3 sticky top-0 z-10 bg-zinc-950/70 rounded-t-3xl border-b border-white/5">
        <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-inner">
          <Icon size={18} className="text-zinc-300" />
        </div>
        <h3 className="font-semibold text-zinc-100 text-base tracking-tight truncate">{title}</h3>
        <span className="ml-auto bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono px-2.5 py-1 rounded-lg">
          {items.length}
        </span>
      </header>

      <div className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar pb-20">
        {items.map((item: NewsItem) => (
          <NewsCard
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onClickExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </section>
  );
};

const SourcesModal = ({ sources, onClose, onAdd, onDelete }: any) => {
  const [newSource, setNewSource] = useState({
    platform: 'youtube',
    identifier: '',
    name: '',
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Zarządzaj Źródłami</h3>
        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
          {sources.map((s: Source) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800"
            >
              <div className="flex items-center gap-2 min-w-0">
                {s.platform === 'youtube' ? (
                  <Youtube size={16} className="text-red-500" />
                ) : (
                  <MessageSquare size={16} className="text-orange-500" />
                )}
                <span className="text-sm font-medium truncate">{s.name}</span>
              </div>
              <button
                onClick={() => onDelete(s.id)}
                className="text-zinc-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <select
              value={newSource.platform}
              onChange={(e) =>
                setNewSource({ ...newSource, platform: e.target.value as 'youtube' | 'reddit' })
              }
              className="bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
            >
              <option value="youtube">YouTube</option>
              <option value="reddit">Reddit</option>
            </select>
            <input
              type="text"
              placeholder="Nazwa (np. AI News)"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              className="flex-1 bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder={
              newSource.platform === 'youtube'
                ? 'ID Kanału (np. UCM...)'
                : 'Subreddit (np. artificial)'
            }
            value={newSource.identifier}
            onChange={(e) => setNewSource({ ...newSource, identifier: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
          />
          <button
            onClick={() => {
              onAdd(newSource);
              setNewSource({ platform: 'youtube', identifier: '', name: '' });
            }}
            className="w-full bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Dodaj Źródło
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<NewsItem | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'youtube' | 'reddit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 1024 : true,
  );
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    const { data: newsData } = await supabase
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false });
    const { data: srcData } = await supabase
      .from('sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (newsData) setNews(newsData as NewsItem[]);
    if (srcData) setSources(srcData as Source[]);
  };

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsLeftSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current?.item as NewsItem);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    const itemId = active.id as string;
    const targetId = over.id as string;

    if (['done', 'trash'].includes(targetId)) {
      setNews((prev) => prev.map((n) => (n.id === itemId ? { ...n, status: targetId as any } : n)));
      await supabase.from('news_items').update({ status: targetId }).eq('id', itemId);
    } else if (
      ['youtube_col', 'reddit_col', 'inbox'].includes(targetId) ||
      targetId.startsWith('yt_') ||
      targetId.startsWith('rd_')
    ) {
      setNews((prev) => prev.map((n) => (n.id === itemId ? { ...n, status: 'inbox' } : n)));
      await supabase.from('news_items').update({ status: 'inbox' }).eq('id', itemId);
    }
  };

  const handleAddSource = async (source: Omit<Source, 'id'>) => {
    const { error } = await supabase.from('sources').insert([source]);
    if (!error) fetchData();
  };

  const handleDeleteSource = async (id: string) => {
    const { error } = await supabase.from('sources').delete().eq('id', id);
    if (!error) fetchData();
  };

  const filteredNews = useMemo(
    () =>
      news.filter((item) => {
        const matchesSource = filterSource === 'all' || item.source_platform === filterSource;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          searchQuery === '' ||
          item.title.toLowerCase().includes(query) ||
          item.summary_points?.some((point) => point.toLowerCase().includes(query));

        return matchesSource && matchesSearch;
      }),
    [news, filterSource, searchQuery],
  );

  const handleUpdateItem = (updated: NewsItem) => {
    setNews((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const inboxCount = news.filter((n) => !n.status || n.status === 'inbox').length;
  const doneCount = news.filter((n) => n.status === 'done').length;
  const hotCount = news.filter((n) => n.category?.toLowerCase().includes('hot')).length;

  const mostRecentDate = news[0]?.published_at
    ? new Date(news[0].published_at).toLocaleDateString('pl-PL')
    : 'brak danych';

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="relative flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
        <div className="pointer-events-none absolute -top-36 -left-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />

        <AnimatePresence>
          {isLeftSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed left-4 top-4 bottom-4 w-72 bg-[#09090b]/70 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col z-50 shadow-2xl shadow-black/50"
            >
              <div className="p-6">
                <h3 className="font-bold text-zinc-100 text-lg tracking-tight mb-6 flex items-center gap-2">
                  <BrainCircuit className="text-emerald-400" />
                  AssistSpace AI
                </h3>

                <nav className="space-y-1">
                  {[
                    { id: 'all', label: 'Wszystko', icon: BrainCircuit, color: 'text-zinc-300', bg: 'bg-zinc-700' },
                    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/20' },
                    { id: 'reddit', label: 'Reddit', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-500/20' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFilterSource(item.id as 'all' | 'youtube' | 'reddit')}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${
                        filterSource === item.id
                          ? 'bg-white/10 text-white shadow-inner border border-white/10'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          filterSource === item.id ? item.bg : 'bg-zinc-800/80'
                        }`}
                      >
                        <item.icon size={16} className={filterSource === item.id ? item.color : 'text-zinc-500'} />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="px-4 pb-5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-zinc-400">Źródła</div>
                  <div className="mt-1 text-base font-semibold text-zinc-100">{sources.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-zinc-400">Wiadomości</div>
                  <div className="mt-1 text-base font-semibold text-zinc-100">{news.length}</div>
                </div>
              </div>

              <div className="mt-auto p-4 space-y-3">
                <button
                  onClick={() => setShowSourcesModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-all group"
                >
                  <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                  <span className="text-xs font-medium">Konfiguracja źródeł</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main
          className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-500 ${
            isLeftSidebarOpen ? 'xl:ml-[304px]' : 'ml-0'
          }`}
        >
          <header className="px-5 md:px-8 mt-4 mb-4 flex flex-col gap-3 z-40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className="p-3 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:border-zinc-600 transition-all shadow-lg"
              >
                <PanelLeft size={20} />
              </button>

              <div className="relative max-w-xl w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Przeszukaj swoją wiedzę..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <Inbox size={18} className="text-blue-400" />
                <div>
                  <div className="text-xs text-zinc-400">Inbox</div>
                  <div className="text-sm font-semibold">{inboxCount}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <div className="text-xs text-zinc-400">Gotowe</div>
                  <div className="text-sm font-semibold">{doneCount}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <Flame size={18} className="text-orange-400" />
                <div>
                  <div className="text-xs text-zinc-400">Hot topics</div>
                  <div className="text-sm font-semibold">{hotCount}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <CalendarClock size={18} className="text-violet-400" />
                <div>
                  <div className="text-xs text-zinc-400">Ostatni update</div>
                  <div className="text-sm font-semibold">{mostRecentDate}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 md:px-5 pb-4 overflow-x-auto flex gap-6 snap-x">
            {filterSource === 'all' ? (
              <>
                <KanbanColumn
                  id="youtube_col"
                  title="YouTube"
                  icon={Youtube}
                  items={filteredNews.filter(
                    (n) => n.source_platform === 'youtube' && n.status !== 'done' && n.status !== 'trash',
                  )}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onUpdate={handleUpdateItem}
                />
                <KanbanColumn
                  id="reddit_col"
                  title="Reddit"
                  icon={MessageSquare}
                  items={filteredNews.filter(
                    (n) => n.source_platform === 'reddit' && n.status !== 'done' && n.status !== 'trash',
                  )}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onUpdate={handleUpdateItem}
                />
                <KanbanColumn
                  id="inbox"
                  title="Inne / Inbox"
                  icon={Inbox}
                  items={filteredNews.filter(
                    (n) =>
                      n.source_platform !== 'youtube' &&
                      n.source_platform !== 'reddit' &&
                      n.status !== 'done' &&
                      n.status !== 'trash',
                  )}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onUpdate={handleUpdateItem}
                />
              </>
            ) : filterSource === 'youtube' ? (
              Array.from(new Set(news.filter((n) => n.source_platform === 'youtube').map((n) => n.author_or_channel)))
                .sort()
                .map((author) => (
                  <KanbanColumn
                    key={author}
                    id={`yt_${author}`}
                    title={author}
                    icon={Youtube}
                    items={filteredNews.filter(
                      (n) =>
                        n.author_or_channel === author && n.status !== 'done' && n.status !== 'trash',
                    )}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    onUpdate={handleUpdateItem}
                  />
                ))
            ) : (
              Array.from(
                new Set(
                  news
                    .filter((n) => n.source_platform === 'reddit')
                    .map((n) => getSubreddit(n.url) || n.author_or_channel),
                ),
              )
                .sort()
                .map((subreddit) => (
                  <KanbanColumn
                    key={subreddit}
                    id={`rd_${subreddit}`}
                    title={subreddit}
                    icon={MessageSquare}
                    items={filteredNews.filter(
                      (n) =>
                        (getSubreddit(n.url) || n.author_or_channel) === subreddit &&
                        n.status !== 'done' &&
                        n.status !== 'trash',
                    )}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    onUpdate={handleUpdateItem}
                  />
                ))
            )}

            <KanbanColumn
              id="done"
              title="Gotowe / Archiwum"
              icon={CheckCircle2}
              items={filteredNews.filter((n) => n.status === 'done')}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onUpdate={handleUpdateItem}
            />

            <div
              id="trash"
              className={`min-w-[150px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all opacity-0 pointer-events-none ${
                activeDragItem
                  ? 'opacity-100 pointer-events-auto border-red-500/50 bg-red-500/5 h-[220px] mt-4'
                  : 'h-0'
              }`}
            >
              <Trash2 size={24} className="text-red-500" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-tighter">Usuń</span>
            </div>
          </div>
        </main>

        <DragOverlay>
          {activeDragItem ? (
            <div className="w-[300px] bg-zinc-900/90 rounded-xl p-4 shadow-2xl border border-emerald-500 rotate-2 cursor-grabbing opacity-90">
              <h4 className="font-bold text-sm text-zinc-100 line-clamp-2">{activeDragItem.title}</h4>
            </div>
          ) : null}
        </DragOverlay>

        {showSourcesModal && (
          <SourcesModal
            sources={sources}
            onClose={() => setShowSourcesModal(false)}
            onAdd={handleAddSource}
            onDelete={handleDeleteSource}
          />
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[100]"
        >
          <Sparkles size={24} />
        </button>

        <AddGlobalItem
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(newItem: NewsItem) => setNews((prev) => [newItem, ...prev])}
        />
      </div>
    </DndContext>
  );
};

export default App;
