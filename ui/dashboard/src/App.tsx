import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import {
    DndContext,
    DragOverlay,
    useDroppable,
    pointerWithin,
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
    Plus,
    Trash2,
    Settings,
    BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
// --- Clients ---

// --- Types ---
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

import { NewsCard } from './components/NewsCard';
import { AddGlobalItem } from './components/AddGlobalItem';



const getSubreddit = (url: string) => {
    try {
        if (url.includes('reddit.com/r/')) {
            return 'r/' + url.split('/r/')[1].split('/')[0];
        }
    } catch (e) { return null; }
    return null;
};

// --- Droppable Column Area ---
const KanbanColumn = ({ id, title, icon: Icon, items, expandedId, setExpandedId, onUpdate }: any) => {
    const { setNodeRef } = useDroppable({ id: id, data: { type: 'column' } });

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[300px] md:min-w-[350px] max-w-[400px] h-full flex flex-col rounded-3xl transition-colors">
            <div className="p-4 flex items-center gap-3 sticky top-0 z-10 transition-colors">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                    <Icon size={18} className="text-zinc-400" />
                </div>
                <h3 className="font-bold text-zinc-100 text-lg tracking-tight">{title}</h3>
                <span className="ml-auto bg-white/5 border border-white/5 text-zinc-400 text-xs font-mono px-2.5 py-1 rounded-lg">{items.length}</span>
            </div>
            <div className="p-2 space-y-4 overflow-y-auto flex-1 custom-scrollbar px-4 pb-20">
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
        </div>
    );
};






// --- Sources Modal ---
const SourcesModal = ({ sources, onClose, onAdd, onDelete }: any) => {
    const [newSource, setNewSource] = useState({ platform: 'youtube', identifier: '', name: '' });
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Zarządzaj Źródłami</h3>
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                    {sources.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-2">
                                {s.platform === 'youtube' ? <Youtube size={16} className="text-red-500" /> : <MessageSquare size={16} className="text-orange-500" />}
                                <span className="text-sm font-medium">{s.name}</span>
                            </div>
                            <button onClick={() => onDelete(s.id)} className="text-zinc-500 hover:text-red-500"><X size={16} /></button>
                        </div>
                    ))}
                </div>
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                        <select
                            value={newSource.platform}
                            onChange={e => setNewSource({ ...newSource, platform: e.target.value })}
                            className="bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
                        >
                            <option value="youtube">YouTube</option>
                            <option value="reddit">Reddit</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Nazwa (np. AI News)"
                            value={newSource.name}
                            onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                            className="flex-1 bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={newSource.platform === 'youtube' ? "ID Kanału (np. UCM...)" : "Subreddit (np. artificial)"}
                        value={newSource.identifier}
                        onChange={e => setNewSource({ ...newSource, identifier: e.target.value })}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none"
                    />
                    <button
                        onClick={() => { onAdd(newSource); setNewSource({ platform: 'youtube', identifier: '', name: '' }); }}
                        className="w-full bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 transition-colors"
                    >
                        Dodaj Źródło
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Preview Modal ---
const PreviewModal = ({ item, onClose }: { item: NewsItem, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
            <div className="w-full max-w-4xl bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg truncate pr-4">{item.title}</h3>
                    <button onClick={onClose} className="hover:bg-zinc-800 p-2 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {item.source_platform === 'youtube' ? (
                        <div className="aspect-video">
                            {/* @ts-ignore */}
                            <ReactPlayer url={item.url} width="100%" height="100%" controls playing />
                        </div>
                    ) : (
                        <div className="p-8">
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{item.summary_points?.join('\n\n') || "Brak podsumowania."}</p>
                            <a href={item.url} target="_blank" className="inline-block mt-6 text-emerald-500 hover:underline">Otwórz oryginał</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- App Component ---
const App: React.FC = () => {


    const [news, setNews] = useState<NewsItem[]>([]);

    const [sources, setSources] = useState<Source[]>([]);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<NewsItem | null>(null);
    const [filterSource, setFilterSource] = useState<'all' | 'youtube' | 'reddit'>('all');

    // Filter & UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);


    // Modals State
    const [showSourcesModal, setShowSourcesModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);


    const fetchData = async () => {
        const { data: newsData } = await supabase.from('news_items').select('*').order('published_at', { ascending: false });
        const { data: srcData } = await supabase.from('sources').select('*').order('created_at', { ascending: false });

        if (newsData) setNews(newsData as any);
        if (srcData) setSources(srcData as any);
    };

    useEffect(() => {
        fetchData();
        const handleResize = () => setIsLeftSidebarOpen(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFilterChange = (source: 'all' | 'youtube' | 'reddit') => {
        setFilterSource(source);
    };

    // --- Drag Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current?.item);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const itemId = active.id as string;
        const targetId = over.id as string;

        // 1. Dropped on a Status Column
        if (['done', 'trash'].includes(targetId)) {
            setNews(prev => prev.map(n => n.id === itemId ? { ...n, status: targetId as any } : n));
            await supabase.from('news_items').update({ status: targetId }).eq('id', itemId);
        }
        // 2. Dropped on a Source/Inbox Column (Reset to Inbox/Active)
        else if (['youtube_col', 'reddit_col', 'inbox'].includes(targetId) || targetId.startsWith('yt_') || targetId.startsWith('rd_')) {
            setNews(prev => prev.map(n => n.id === itemId ? { ...n, status: 'inbox' } : n));
            await supabase.from('news_items').update({ status: 'inbox' }).eq('id', itemId);
        }
    };


    const handleAddSource = async (source: any) => {
        const { error } = await supabase.from('sources').insert([source]);
        if (!error) fetchData();
    };

    const handleDeleteSource = async (id: string) => {
        const { error } = await supabase.from('sources').delete().eq('id', id);
        if (!error) fetchData();
    };

    // Filter logic
    const filteredNews = news.filter(item => {
        const matchesSource = filterSource === 'all' || item.source_platform === filterSource;
        const matchesSearch = searchQuery === '' ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary_points?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSource && matchesSearch;
    });

    const handleUpdateItem = (updated: NewsItem) => {
        setNews(prev => prev.map(n => n.id === updated.id ? updated : n));
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
            <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">

                {/* Floating Left Sidebar */}
                <AnimatePresence>
                    {isLeftSidebarOpen && (
                        <motion.aside
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className="fixed left-4 top-4 bottom-4 w-64 bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col z-50 shadow-2xl shadow-black/50"
                        >
                            <div className="p-6">
                                <h3 className="font-bold text-zinc-100 text-lg tracking-tight mb-6 flex items-center gap-2">
                                    <BrainCircuit className="text-emerald-500" />
                                    AI Master
                                </h3>

                                <div className="space-y-1">
                                    {[
                                        { id: 'all', label: 'Wszystko', icon: BrainCircuit, color: 'text-zinc-300', bg: 'bg-zinc-700' },
                                        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/20' },
                                        { id: 'reddit', label: 'Reddit', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-500/20' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleFilterChange(item.id as any)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${filterSource === item.id
                                                ? 'bg-white/5 text-white shadow-inner shadow-white/5 border border-white/5'
                                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${filterSource === item.id ? item.bg : 'bg-zinc-800'}`}>
                                                <item.icon size={16} className={filterSource === item.id ? item.color : 'text-zinc-500'} />
                                            </div>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto p-4 space-y-4">
                                <button
                                    onClick={() => setShowSourcesModal(true)}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all group"
                                >
                                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                    <span className="text-xs font-medium">Konfiguracja</span>
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Infinite Canvas */}
                <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isLeftSidebarOpen ? 'md:ml-[280px]' : 'ml-0'}`}>

                    {/* Floating Header */}
                    <header className="px-8 mt-4 mb-4 flex justify-between items-center z-40">
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="p-3 bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:border-zinc-700 transition-all shadow-lg">
                                <PanelLeft size={20} />
                            </button>

                            <div className="relative max-w-lg w-full group">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Przeszukaj swoją wiedzę..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="relative w-full bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-white/10 focus:ring-1 focus:ring-white/5 transition-all shadow-lg placeholder:text-zinc-600 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 shadow-lg">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                <Inbox size={14} className="text-blue-400" />
                                <span className="text-xs font-medium text-zinc-400">Inbox: <strong className="text-zinc-200">{news.filter(n => !n.status || n.status === 'inbox').length}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                <span className="text-xs font-medium text-zinc-400">Gotowe: <strong className="text-zinc-200">{news.filter(n => n.status === 'done').length}</strong></span>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 p-0 overflow-x-auto flex gap-8 snap-x pl-4">
                        {filterSource === 'all' ? (
                            <>
                                <KanbanColumn
                                    id="youtube_col"
                                    title="YouTube"
                                    icon={Youtube}
                                    items={filteredNews.filter(n => n.source_platform === 'youtube' && n.status !== 'done' && n.status !== 'trash')}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                    onUpdate={handleUpdateItem}
                                />
                                <KanbanColumn
                                    id="reddit_col"
                                    title="Reddit"
                                    icon={MessageSquare}
                                    items={filteredNews.filter(n => n.source_platform === 'reddit' && n.status !== 'done' && n.status !== 'trash')}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                    onUpdate={handleUpdateItem}
                                />
                                <KanbanColumn
                                    id="inbox"
                                    title="Inne / Inbox"
                                    icon={Inbox}
                                    items={filteredNews.filter(n => n.source_platform !== 'youtube' && n.source_platform !== 'reddit' && n.status !== 'done' && n.status !== 'trash')}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                    onUpdate={handleUpdateItem}
                                />
                            </>
                        ) : filterSource === 'youtube' ? (
                            <>
                                {Array.from(new Set(news.filter(n => n.source_platform === 'youtube').map(n => n.author_or_channel))).sort().map(author => (
                                    <KanbanColumn
                                        key={author}
                                        id={`yt_${author}`}
                                        title={author}
                                        icon={Youtube}
                                        items={filteredNews.filter(n => n.author_or_channel === author && n.status !== 'done' && n.status !== 'trash')}
                                        expandedId={expandedId}
                                        setExpandedId={setExpandedId}
                                        onUpdate={handleUpdateItem}
                                    />
                                ))}
                            </>
                        ) : filterSource === 'reddit' ? (
                            <>
                                {Array.from(new Set(news.filter(n => n.source_platform === 'reddit').map(n => getSubreddit(n.url) || n.author_or_channel))).sort().map(subreddit => (
                                    <KanbanColumn
                                        key={subreddit}
                                        id={`rd_${subreddit}`}
                                        title={subreddit}
                                        icon={MessageSquare}
                                        items={filteredNews.filter(n => (getSubreddit(n.url) || n.author_or_channel) === subreddit && n.status !== 'done' && n.status !== 'trash')}
                                        expandedId={expandedId}
                                        setExpandedId={setExpandedId}
                                        onUpdate={handleUpdateItem}
                                    />
                                ))}
                            </>
                        ) : (
                            // Trash/Inbox cases in 'all' view already handled above. 
                            // This part is for filterSource === 'all' but we already handled it. 
                            // If user adds more specific platform filters, they go here.
                            null
                        )}

                        {/* Always show Archive column at the end */}
                        <KanbanColumn
                            id="done"
                            title="Gotowe / Archiwum"
                            icon={CheckCircle2}
                            items={filteredNews.filter(n => n.status === 'done')}
                            expandedId={expandedId}
                            setExpandedId={setExpandedId}
                            setPreviewItem={setPreviewItem}
                        />

                        {/* Trash zone (visible only during drag) */}
                        <div
                            id="trash"
                            className={`min-w-[150px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all opacity-0 pointer-events-none ${activeDragItem ? 'opacity-100 pointer-events-auto border-red-500/50 bg-red-500/5 h-[200px] mt-4' : 'h-0'}`}
                        >
                            <Trash2 size={24} className="text-red-500" />
                            <span className="text-xs font-bold text-red-500 uppercase tracking-tighter">Usuń</span>
                        </div>
                    </div>
                </main>






                {/* Drag Overlay */}
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="w-[300px] bg-zinc-800 rounded-xl p-4 shadow-2xl border border-emerald-500 rotate-3 cursor-grabbing opacity-90">
                            <h4 className="font-bold text-sm text-zinc-100">{activeDragItem.title}</h4>
                        </div>
                    ) : null}
                </DragOverlay>



                {/* Sources Modal */}
                {showSourcesModal && (
                    <SourcesModal
                        sources={sources}
                        onClose={() => setShowSourcesModal(false)}
                        onAdd={handleAddSource}
                        onDelete={handleDeleteSource}
                    />
                )}



                {/* Preview Modal */}
                {previewItem && (
                    <PreviewModal
                        item={previewItem}
                        onClose={() => setPreviewItem(null)}
                    />
                )}

                {/* Floating Action Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[100]"
                >
                    <Plus size={32} />
                </button>

                <AddGlobalItem
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={(newItem: NewsItem) => setNews(prev => [newItem, ...prev])}
                />

            </div>
        </DndContext >
    );
};

export default App;
