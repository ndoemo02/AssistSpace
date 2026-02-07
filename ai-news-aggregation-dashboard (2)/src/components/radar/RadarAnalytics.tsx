import {
  BarChart3,
  TrendingUp,
  Users,
  Radio,
  Flame,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';

export function RadarAnalytics() {
  const { radar } = useStore();

  const hotLeads = radar.leads.filter((l) => l.automationReadiness === 'hot').length;
  const warmLeads = radar.leads.filter((l) => l.automationReadiness === 'warm').length;
  const qualifiedLeads = radar.leads.filter((l) => l.status === 'qualified' || l.status === 'outreach_ready').length;
  const avgScore = Math.round(radar.leads.reduce((acc, l) => acc + l.score, 0) / (radar.leads.length || 1));

  const leadsByIndustry = radar.leads.reduce((acc, lead) => {
    const industry = lead.industry || 'Nieznana';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topIndustries = Object.entries(leadsByIndustry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Analityka Radar</h1>
        <p className="text-sm text-slate-500 sm:text-base">Przegląd pipeline'u i efektywności</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-200 sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between">
            <Users className="h-6 w-6 opacity-80 sm:h-8 sm:w-8" />
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              +12%
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl">{radar.leads.length}</p>
          <p className="text-sm opacity-80">Wszystkie leady</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-lg shadow-amber-200 sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between">
            <Flame className="h-6 w-6 opacity-80 sm:h-8 sm:w-8" />
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              +8%
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl">{hotLeads}</p>
          <p className="text-sm opacity-80">Hot Leads</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg shadow-blue-200 sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between">
            <Radio className="h-6 w-6 opacity-80 sm:h-8 sm:w-8" />
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              +24%
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl">{radar.signals.length}</p>
          <p className="text-sm opacity-80">Sygnałów</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 text-white shadow-lg shadow-purple-200 sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between">
            <Target className="h-6 w-6 opacity-80 sm:h-8 sm:w-8" />
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              <ArrowDownRight className="h-3 w-3" />
              -2%
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl">{avgScore}%</p>
          <p className="text-sm opacity-80">Avg Score</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Pipeline Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Pipeline Leadów</h3>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">Ten miesiąc</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Hot', count: hotLeads, color: 'bg-red-500', total: radar.leads.length },
              { label: 'Warm', count: warmLeads, color: 'bg-amber-500', total: radar.leads.length },
              { label: 'Zakwalifikowane', count: qualifiedLeads, color: 'bg-emerald-500', total: radar.leads.length },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{ width: `${(item.count / (item.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Branże</h3>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">Top 5</span>
          </div>
          <div className="space-y-3">
            {topIndustries.map(([industry, count], index) => (
              <div key={industry} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{industry}</p>
                  <p className="text-xs text-slate-500">{count} leadów</p>
                </div>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(count / radar.leads.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topIndustries.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">Brak danych o branżach</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Ostatnia aktywność</h3>
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <div className="space-y-4">
          {radar.signals.slice(0, 5).map((signal, index) => (
            <div key={signal.id} className="flex items-start gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <Radio className="h-4 w-4 text-emerald-600" />
                </div>
                {index < Math.min(radar.signals.length, 5) - 1 && (
                  <div className="absolute left-1/2 top-8 h-8 w-0.5 -translate-x-1/2 bg-slate-200" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-slate-900">Nowy sygnał wykryty</p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{signal.content}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(signal.detectedAt).toLocaleString('pl-PL')}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  signal.relevanceScore >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : signal.relevanceScore >= 60
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {signal.relevanceScore}%
              </span>
            </div>
          ))}
          {radar.signals.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">Brak aktywności</p>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Konwersja</p>
              <p className="text-lg font-bold text-slate-900">
                {Math.round((qualifiedLeads / (radar.leads.length || 1)) * 100)}%
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Aktywne kanały</p>
              <p className="text-lg font-bold text-slate-900">
                {radar.channels.filter((c) => c.isActive).length}/{radar.channels.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Outreach Ready</p>
              <p className="text-lg font-bold text-slate-900">
                {radar.leads.filter((l) => l.status === 'outreach_ready').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
