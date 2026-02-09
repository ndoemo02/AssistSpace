import { useState } from 'react';
import {
  Radio,
  Zap,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
  Filter,
  RefreshCw,
  Youtube,
  MessageSquare,
  Linkedin,
  Twitter,
  Users,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { FlowAssistMarket } from '@/types';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z" />
  </svg>
);

const sourceIcons: Record<FlowAssistMarket.SignalSource, React.ElementType> = {
  youtube_comments: Youtube,
  reddit_post: RedditIcon,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook_group: Users,
  facebook: Users,
  instagram: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  tiktok: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v4.95c0 3.25-2.69 5.9-5.94 5.9-3.25 0-5.9-2.65-5.9-5.9 0-3.25 2.65-5.9 5.9-5.9 1.17 0 2.28.36 3.22.98V4.2c-1.1-.96-2.5-1.55-3.96-1.55-3.25 0-5.9 2.65-5.9 5.9 0 3.25 2.65 5.9 5.9 5.9 1.69 0 3.24-.71 4.31-1.85.25-.26.47-.54.67-.84.06-.09.11-.18.16-.27l.01-.01.01-.02.01-.01V.02z" />
    </svg>
  ),
  custom: MessageSquare,
};

const sourceLabels: Record<FlowAssistMarket.SignalSource, string> = {
  youtube_comments: 'YouTube',
  reddit_post: 'Reddit',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  facebook_group: 'Facebook Group',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  custom: 'Custom',
};

export function SignalScanner() {
  const { radar, addLead, setRadarTab, fetchLeads } = useStore();
  const [filter, setFilter] = useState<'all' | FlowAssistMarket.SignalSource>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanConfig, setScanConfig] = useState({
    niche: '',
    location: '',
    source: 'instagram' as 'instagram' | 'tiktok' | 'facebook',
  });

  const handleScanClick = () => {
    setShowScanModal(true);
  };

  const handleStartScan = async () => {
    if (!scanConfig.niche) return;

    setIsScanning(true);
    setShowScanModal(false);

    try {
      await fetch('http://localhost:8000/api/run-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: scanConfig.niche,
          location: scanConfig.location,
          sources: [scanConfig.source]
        }),
      });
      // Scan started in background
    } catch (e) {
      console.error("Failed to start scan:", e);
      setIsScanning(false);
    }

    // Reset scanning state and refresh data
    setTimeout(() => {
      setIsScanning(false);
      fetchLeads();
    }, 8000); // 8 seconds to allow background process to start and maybe find first few leads
  };

  const filteredSignals =
    filter === 'all' ? radar.signals : radar.signals.filter((s) => s.source === filter);

  const handleConvertToLead = (signal: FlowAssistMarket.Signal) => {
    addLead({
      companyName: 'Nowa firma z sygnału',
      status: 'detected',
      automationReadiness: signal.relevanceScore > 80 ? 'hot' : 'warm',
      score: signal.relevanceScore,
      signals: [signal],
      notes: signal.automationOpportunity,
      tags: signal.painPoints,
    });
    setRadarTab('leads');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-slate-600 bg-slate-100';
  };

  const getSentimentColor = (sentiment: FlowAssistMarket.Signal['sentiment']) => {
    switch (sentiment) {
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'positive':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Skaner Sygnałów</h1>
          <p className="text-sm text-slate-500 sm:text-base">
            Wykrywaj firmy gotowe na automatyzację
          </p>
        </div>
        <button
          onClick={handleScanClick}
          disabled={isScanning}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl',
            isScanning && 'opacity-75'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', isScanning && 'animate-spin')} />
          <span>{isScanning ? 'Skanuję...' : 'Nowy Skan'}</span>
        </button>
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Konfiguracja Skanowania</h2>
            <p className="mt-1 text-sm text-slate-500">Określ parametry wyszukiwania leadów.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nisza / Słowo kluczowe</label>
                <input
                  type="text"
                  value={scanConfig.niche}
                  onChange={(e) => setScanConfig({ ...scanConfig, niche: e.target.value })}
                  placeholder="np. fryzjer, mechanik"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Lokalizacja (opcjonalne)</label>
                <input
                  type="text"
                  value={scanConfig.location}
                  onChange={(e) => setScanConfig({ ...scanConfig, location: e.target.value })}
                  placeholder="np. warszawa"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Źródło</label>
                <select
                  value={scanConfig.source}
                  onChange={(e) => setScanConfig({ ...scanConfig, source: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowScanModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleStartScan}
                disabled={!scanConfig.niche}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                Rozpocznij Skanowanie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-emerald-500 p-2 sm:rounded-xl sm:p-2.5">
              <Radio className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{radar.signals.length}</p>
              <p className="text-xs text-slate-600 sm:text-sm">Sygnałów</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-amber-500 p-2 sm:rounded-xl sm:p-2.5">
              <Zap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                {radar.signals.filter((s) => s.relevanceScore >= 80).length}
              </p>
              <p className="text-xs text-slate-600 sm:text-sm">Hot</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-blue-500 p-2 sm:rounded-xl sm:p-2.5">
              <TrendingUp className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                {Math.round(
                  radar.signals.reduce((acc, s) => acc + s.relevanceScore, 0) /
                  (radar.signals.length || 1)
                )}
                %
              </p>
              <p className="text-xs text-slate-600 sm:text-sm">Avg Score</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-red-500 p-2 sm:rounded-xl sm:p-2.5">
              <AlertCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                {radar.signals.filter((s) => s.sentiment === 'negative').length}
              </p>
              <p className="text-xs text-slate-600 sm:text-sm">Pain Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:rounded-xl sm:px-4',
            filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Filter className="h-4 w-4" />
          Wszystkie
        </button>
        {(Object.keys(sourceLabels) as FlowAssistMarket.SignalSource[]).slice(0, 4).map((source) => {
          const Icon = sourceIcons[source];
          return (
            <button
              key={source}
              onClick={() => setFilter(source)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:rounded-xl sm:px-4',
                filter === source
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{sourceLabels[source]}</span>
            </button>
          );
        })}
      </div>

      {/* Signals List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredSignals.map((signal) => {
          const Icon = sourceIcons[signal.source];
          return (
            <div
              key={signal.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {sourceLabels[signal.source]}
                    </span>
                    <span
                      className={cn(
                        'ml-2 rounded-full px-2 py-0.5 text-xs font-medium',
                        getSentimentColor(signal.sentiment)
                      )}
                    >
                      {signal.sentiment === 'negative'
                        ? 'Pain Point'
                        : signal.sentiment === 'positive'
                          ? 'Pozytywny'
                          : 'Neutralny'}
                    </span>
                  </div>
                </div>
                <div
                  className={cn('rounded-lg px-2.5 py-1 text-sm font-bold', getScoreColor(signal.relevanceScore))}
                >
                  {signal.relevanceScore}%
                </div>
              </div>

              <blockquote className="mt-3 border-l-2 border-emerald-300 pl-4 text-sm italic text-slate-700 sm:text-base">
                {signal.content}
              </blockquote>

              <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-800">💡 Okazja do automatyzacji:</p>
                <p className="mt-1 text-sm text-emerald-700">{signal.automationOpportunity}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {signal.painPoints.map((point) => (
                  <span
                    key={point}
                    className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                  >
                    #{point}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">
                  {new Date(signal.detectedAt).toLocaleString('pl-PL')}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={signal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Źródło
                  </a>
                  <button
                    onClick={() => handleConvertToLead(signal)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-emerald-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Utwórz Lead
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSignals.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Radio className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak sygnałów</h3>
          <p className="mt-1 text-sm text-slate-500">Uruchom skanowanie, aby wykryć nowe okazje</p>
        </div>
      )}
    </div>
  );
}
