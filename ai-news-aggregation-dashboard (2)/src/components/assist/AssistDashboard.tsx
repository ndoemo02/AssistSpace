import { useMemo, useState } from 'react';
import {
  Youtube,
  Github,
  RefreshCw,
  TrendingUp,
  Zap,
  Star,
  ExternalLink,
  Clock,
  Sparkles,
  Loader2,
  Download,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z" />
  </svg>
);

export function AssistDashboard() {
  const { addKnowledgeItem, setAssistTab, assist } = useStore();
  const { isLoading, error } = useSupabaseSync();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'youtube' | 'reddit' | 'github'>('all');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloadingMp3, setIsDownloadingMp3] = useState(false);
  const [mp3Error, setMp3Error] = useState<string | null>(null);
  const [mp3Success, setMp3Success] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleSaveToCollection = (item: typeof assist.knowledgeItems[0]) => {
    // Item is already in collection from Supabase
    console.log('Item already saved:', item.id);
  };

  const filteredFeed = filter === 'all'
    ? assist.knowledgeItems
    : assist.knowledgeItems.filter((item) => item.category === filter);

  const youtubeToMp3Endpoint = useMemo(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    return `${apiBase}/api/youtube-to-mp3`;
  }, []);

  const extractFilename = (contentDisposition: string | null): string => {
    if (!contentDisposition) return 'youtube-audio.mp3';

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return standardMatch?.[1] || 'youtube-audio.mp3';
  };

  const handleYoutubeMp3Download = async () => {
    const trimmedUrl = youtubeUrl.trim();

    if (!trimmedUrl) {
      setMp3Error('Wklej link YouTube, aby pobrać MP3.');
      setMp3Success(null);
      return;
    }

    setIsDownloadingMp3(true);
    setMp3Error(null);
    setMp3Success(null);

    try {
      const response = await fetch(youtubeToMp3Endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        let message = `Nie udało się pobrać MP3 (HTTP ${response.status}).`;
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch {
          // keep fallback message
        }
        setMp3Error(message);
        return;
      }

      const blob = await response.blob();
      const filename = extractFilename(response.headers.get('content-disposition'));
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);

      setMp3Success(`Pobrano plik: ${filename}`);
      setYoutubeUrl('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd połączenia.';
      setMp3Error(`Błąd połączenia z API: ${message}`);
    } finally {
      setIsDownloadingMp3(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'reddit':
        return <div className="text-orange-500"><RedditIcon /></div>;
      case 'github':
        return <Github className="h-5 w-5 text-slate-900" />;
      default:
        return null;
    }
  };

  // Count items by source
  const youtubeCount = assist.knowledgeItems.filter(i => i.category === 'youtube').length;
  const redditCount = assist.knowledgeItems.filter(i => i.category === 'reddit').length;
  const githubCount = assist.knowledgeItems.filter(i => i.category === 'github').length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-600">Ładowanie danych z Supabase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center">
        <p className="font-medium text-red-600">Błąd ładowania: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Knowledge Dashboard</h1>
          <p className="text-sm text-slate-500 sm:text-base">Najnowsze newsy i research ze świata AI</p>
        </div>
        <button
          onClick={handleRefresh}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl',
            isRefreshing && 'opacity-75'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież feed'}</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-red-500 p-2 sm:rounded-xl sm:p-2.5">
              <Youtube className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{youtubeCount}</p>
              <p className="text-xs text-slate-600 sm:text-sm">YouTube</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-orange-500 p-2 text-white sm:rounded-xl sm:p-2.5">
              <RedditIcon />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{redditCount}</p>
              <p className="text-xs text-slate-600 sm:text-sm">Reddit</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-slate-900 p-2 sm:rounded-xl sm:p-2.5">
              <Github className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{githubCount}</p>
              <p className="text-xs text-slate-600 sm:text-sm">GitHub</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-violet-500 p-2 sm:rounded-xl sm:p-2.5">
              <TrendingUp className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{assist.knowledgeItems.length}</p>
              <p className="text-xs text-slate-600 sm:text-sm">Zapisanych</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base">
              <Download className="h-4 w-4 text-violet-600" />
              YouTube → MP3
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Wklej link YouTube i pobierz audio jako MP3.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white sm:min-w-[360px]"
            />
            <button
              onClick={handleYoutubeMp3Download}
              disabled={isDownloadingMp3}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloadingMp3 ? 'Pobieranie...' : 'Pobierz MP3'}
            </button>
          </div>
        </div>

        {mp3Error && <p className="mt-3 text-xs text-red-600 sm:text-sm">{mp3Error}</p>}
        {mp3Success && <p className="mt-3 text-xs text-emerald-600 sm:text-sm">{mp3Success}</p>}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Wszystkie', icon: Zap },
          { id: 'youtube', label: 'YouTube', icon: Youtube },
          { id: 'reddit', label: 'Reddit', icon: () => <RedditIcon /> },
          { id: 'github', label: 'GitHub', icon: Github },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:rounded-xl sm:px-4',
                filter === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {filteredFeed.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 sm:rounded-2xl sm:p-4"
          >
            <div className="flex gap-3 sm:gap-4">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="hidden h-20 w-32 rounded-lg object-cover xs:block sm:h-24 sm:w-40 sm:rounded-xl"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(item.category)}
                    <span className="truncate text-xs font-medium text-slate-500">
                      {item.description || item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSaveToCollection(item)}
                    className={cn(
                      "shrink-0 rounded-lg p-1.5 transition-all hover:bg-violet-100 hover:text-violet-600",
                      item.isFavorite ? "text-yellow-500" : "text-slate-400"
                    )}
                  >
                    <Star className={cn("h-4 w-4", item.isFavorite && "fill-yellow-400")} />
                  </button>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-slate-900 line-clamp-2 sm:mt-2 sm:text-base">
                  {item.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:mt-2 sm:gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.addedAt).toLocaleDateString('pl-PL')}
                  </span>
                  {item.tags.length > 0 && (
                    <span className="hidden sm:inline">{item.tags.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 flex gap-2 sm:mt-3">
              <button
                onClick={() => setAssistTab('ai-chat')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-2 py-1.5 text-xs font-medium text-violet-600 transition-all hover:bg-violet-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Podsumuj z AI
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Otwórz
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
