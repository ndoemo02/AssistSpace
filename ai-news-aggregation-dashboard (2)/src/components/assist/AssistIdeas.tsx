import { useState } from 'react';
import { Plus, Lightbulb, Edit3, Trash2, Tag, Clock, Search, X, Rocket, Target, Cpu, FlaskConical, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { AssistPersonal } from '@/types';

const ideaCategories: { id: AssistPersonal.IdeaNote['category']; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'product', label: 'Produkt', icon: Rocket, color: 'from-violet-500 to-purple-600' },
  { id: 'strategy', label: 'Strategia', icon: Target, color: 'from-blue-500 to-indigo-600' },
  { id: 'tech', label: 'Tech', icon: Cpu, color: 'from-emerald-500 to-teal-600' },
  { id: 'research', label: 'Research', icon: FlaskConical, color: 'from-amber-500 to-orange-600' },
  { id: 'inspiration', label: 'Inspiracja', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
];

export function AssistIdeas() {
  const { assist, addIdea, deleteIdea } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssistPersonal.IdeaNote['category'] | 'all'>('all');
  const [editingIdea, setEditingIdea] = useState<AssistPersonal.IdeaNote | null>(null);
  const [newIdea, setNewIdea] = useState({
    title: '',
    content: '',
    category: 'product' as AssistPersonal.IdeaNote['category'],
    tags: [] as string[],
    linkedItems: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  const handleAddIdea = () => {
    if (!newIdea.title.trim()) return;
    addIdea(newIdea);
    setNewIdea({ title: '', content: '', category: 'product', tags: [], linkedItems: [] });
    setIsAdding(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newIdea.tags.includes(newTag.trim())) {
      setNewIdea({ ...newIdea, tags: [...newIdea.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewIdea({ ...newIdea, tags: newIdea.tags.filter((t) => t !== tag) });
  };

  const filteredIdeas = assist.ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category: AssistPersonal.IdeaNote['category']) => {
    return ideaCategories.find((c) => c.id === category) || ideaCategories[0];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Pomysły & Notatki</h1>
          <p className="text-sm text-slate-500 sm:text-base">Twoja przestrzeń na strategiczne myślenie</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          Nowy pomysł
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj pomysłów..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:py-3 sm:pl-12"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn('shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium', selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
          >
            Wszystkie
          </button>
          {ideaCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingIdea) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{editingIdea ? 'Edytuj pomysł' : 'Nowy pomysł'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingIdea(null); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tytuł</label>
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  placeholder="np. Nowa funkcja AI..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kategoria</label>
                <div className="flex flex-wrap gap-2">
                  {ideaCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewIdea({ ...newIdea, category: cat.id })}
                        className={cn('flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all', newIdea.category === cat.id ? `bg-gradient-to-r ${cat.color} text-white` : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                      >
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Treść</label>
                <textarea
                  value={newIdea.content}
                  onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                  placeholder="Opisz swój pomysł..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tagi</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Dodaj tag..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-300 focus:outline-none"
                  />
                  <button onClick={handleAddTag} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
                    Dodaj
                  </button>
                </div>
                {newIdea.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {newIdea.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
                        <Tag className="h-2.5 w-2.5" />{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 hover:text-violet-800">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setIsAdding(false); setEditingIdea(null); }} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Anuluj
              </button>
              <button onClick={handleAddIdea} disabled={!newIdea.title.trim()} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50">
                {editingIdea ? 'Zapisz' : 'Dodaj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea) => {
          const catInfo = getCategoryInfo(idea.category);
          const Icon = catInfo.icon;
          return (
            <div key={idea.id} className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 sm:rounded-2xl sm:p-5">
              <div className="flex items-start justify-between">
                <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', catInfo.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => { setEditingIdea(idea); setNewIdea({ title: idea.title, content: idea.content, category: idea.category, tags: idea.tags, linkedItems: idea.linkedItems }); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteIdea(idea.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">{idea.title}</h3>
              {idea.content && <p className="mt-1 text-xs text-slate-500 line-clamp-3 sm:text-sm">{idea.content}</p>}
              {idea.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
                      <Tag className="h-2.5 w-2.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(idea.createdAt).toLocaleDateString('pl-PL')}
              </div>
            </div>
          );
        })}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Lightbulb className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak pomysłów</h3>
          <p className="mt-1 text-sm text-slate-500">Dodaj swój pierwszy pomysł</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
            <Plus className="h-4 w-4" />
            Nowy pomysł
          </button>
        </div>
      )}
    </div>
  );
}
