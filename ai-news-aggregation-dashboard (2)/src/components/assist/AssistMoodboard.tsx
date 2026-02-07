import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Sparkles,
  Youtube,
  Github,
  FileText,
  Wrench,
  FlaskConical,
  Lightbulb,
  BookOpen,
  HelpCircle,
  GripVertical,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { AssistPersonal } from '@/types';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0z" />
  </svg>
);

const categories: { id: AssistPersonal.Category; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { id: 'reddit', label: 'Reddit', icon: () => <RedditIcon />, color: 'from-orange-500 to-orange-600' },
  { id: 'github', label: 'GitHub', icon: Github, color: 'from-slate-700 to-slate-900' },
  { id: 'articles', label: 'Artykuły', icon: FileText, color: 'from-blue-500 to-blue-600' },
  { id: 'tools', label: 'Narzędzia', icon: Wrench, color: 'from-emerald-500 to-emerald-600' },
  { id: 'research', label: 'Research', icon: FlaskConical, color: 'from-purple-500 to-purple-600' },
  { id: 'ideas', label: 'Pomysły', icon: Lightbulb, color: 'from-amber-500 to-amber-600' },
  { id: 'learning', label: 'Nauka', icon: BookOpen, color: 'from-pink-500 to-pink-600' },
];

interface SortableItemProps {
  item: AssistPersonal.KnowledgeItem;
  onDelete: (id: string) => void;
}

function SortableItem({ item, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition-all sm:rounded-xl sm:p-3',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-900 sm:text-sm">{item.title}</p>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{item.url}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </a>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}

function DropZone({
  category,
  items,
  onDelete,
}: {
  category: typeof categories[0];
  items: AssistPersonal.KnowledgeItem[];
  onDelete: (id: string) => void;
}) {
  const Icon = category.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center gap-2 sm:mb-3">
        <div className={cn('rounded-lg bg-gradient-to-br p-1.5 text-white sm:p-2', category.color)}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{category.label}</h3>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onDelete={onDelete} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400 sm:h-20 sm:rounded-xl sm:text-sm">
            Przeciągnij tutaj
          </div>
        )}
      </div>
    </div>
  );
}

export function AssistMoodboard() {
  const { assist, addKnowledgeItem, deleteKnowledgeItem, moveToCategory } = useStore();
  const [newUrl, setNewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const uncategorizedItems = assist.knowledgeItems.filter((l) => l.category === 'uncategorized');

  const handleAddLink = async () => {
    if (!newUrl.trim()) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const detectedCategory = detectCategory(newUrl);
    const title = extractTitle(newUrl);

    addKnowledgeItem({
      url: newUrl,
      title,
      category: detectedCategory,
      source: detectSource(newUrl),
      tags: [],
      isFavorite: false,
    });

    setNewUrl('');
    setIsProcessing(false);
  };

  const detectCategory = (url: string): AssistPersonal.Category => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('github.com')) return 'github';
    if (url.includes('arxiv.org') || url.includes('paper')) return 'research';
    return 'articles';
  };

  const detectSource = (url: string): AssistPersonal.KnowledgeItem['source'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('github.com')) return 'github';
    return 'custom';
  };

  const extractTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/_/g, ' ');
      }
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const targetCategory = categories.find((cat) =>
        assist.knowledgeItems.filter((l) => l.category === cat.id).some((l) => l.id === over.id)
      );

      if (targetCategory) {
        moveToCategory(active.id as string, targetCategory.id);
      }
    }
  };

  const activeItem = activeId ? assist.knowledgeItems.find((l) => l.id === activeId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Moodboard</h1>
        <p className="text-sm text-slate-500 sm:text-base">Organizuj zasoby wiedzy - AI kategoryzuje automatycznie</p>
      </div>

      {/* Add Link Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="Wklej link (YouTube, Reddit, GitHub...)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm transition-all placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 sm:rounded-xl sm:px-4 sm:py-3 sm:pr-12"
            />
            {isProcessing && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-500 sm:h-5 sm:w-5" />
              </div>
            )}
          </div>
          <button
            onClick={handleAddLink}
            disabled={isProcessing || !newUrl.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl disabled:opacity-50 sm:rounded-xl sm:px-5 sm:py-3"
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI kategoryzuje...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Dodaj
              </>
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 sm:mt-3">
          <Sparkles className="h-3 w-3 shrink-0 text-violet-500" />
          <span>AI automatycznie rozpozna źródło i przypisze do kategorii</span>
        </div>
      </div>

      {/* Uncategorized */}
      {uncategorizedItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 sm:rounded-2xl sm:p-4">
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <HelpCircle className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
            <h3 className="text-sm font-semibold text-amber-900 sm:text-base">Do skategoryzowania</h3>
            <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
              {uncategorizedItems.length}
            </span>
          </div>
          <p className="mb-2 text-xs text-amber-700 sm:mb-3 sm:text-sm">
            Przeciągnij te elementy do odpowiednich kategorii
          </p>
          <div className="space-y-2">
            {uncategorizedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2 sm:rounded-xl sm:p-3"
              >
                <GripVertical className="h-4 w-4 cursor-grab text-slate-400 active:cursor-grabbing" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-900 sm:text-sm">{item.title}</p>
                  <p className="hidden truncate text-xs text-slate-500 sm:block">{item.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <DropZone
              key={category.id}
              category={category}
              items={assist.knowledgeItems.filter((l) => l.category === category.id)}
              onDelete={deleteKnowledgeItem}
            />
          ))}
        </div>
        <DragOverlay>
          {activeItem && (
            <div className="rounded-xl border border-violet-200 bg-white p-3 shadow-xl">
              <p className="truncate text-sm font-medium text-slate-900">{activeItem.title}</p>
              <p className="truncate text-xs text-slate-500">{activeItem.url}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
