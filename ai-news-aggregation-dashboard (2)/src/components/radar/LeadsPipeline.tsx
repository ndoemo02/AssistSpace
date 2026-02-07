import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Flame,
  Thermometer,
  Snowflake,
  Building2,
  Globe,
  Tag,
  Clock,
  ChevronDown,
  X,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { FlowAssistMarket } from '@/types';

const statusLabels: Record<FlowAssistMarket.LeadStatus, string> = {
  detected: 'Wykryty',
  qualified: 'Zakwalifikowany',
  researched: 'Zbadany',
  outreach_ready: 'Gotowy do kontaktu',
  contacted: 'Skontaktowany',
  archived: 'Zarchiwizowany',
};

const statusColors: Record<FlowAssistMarket.LeadStatus, string> = {
  detected: 'bg-slate-100 text-slate-700',
  qualified: 'bg-blue-100 text-blue-700',
  researched: 'bg-purple-100 text-purple-700',
  outreach_ready: 'bg-emerald-100 text-emerald-700',
  contacted: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-500',
};

const readinessIcons: Record<FlowAssistMarket.AutomationReadiness, React.ElementType> = {
  hot: Flame,
  warm: Thermometer,
  cold: Snowflake,
  not_ready: X,
};

const readinessColors: Record<FlowAssistMarket.AutomationReadiness, string> = {
  hot: 'text-red-500',
  warm: 'text-amber-500',
  cold: 'text-blue-500',
  not_ready: 'text-slate-400',
};

export function LeadsPipeline() {
  const { radar, updateLead, deleteLead } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FlowAssistMarket.LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<FlowAssistMarket.Lead | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredLeads = radar.leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-slate-600';
  };

  const handleStatusChange = (leadId: string, newStatus: FlowAssistMarket.LeadStatus) => {
    updateLead(leadId, { status: newStatus });
  };

  // Group leads by status for Kanban view (for future use)
  const _leadsByStatus = (Object.keys(statusLabels) as FlowAssistMarket.LeadStatus[]).reduce(
    (acc, status) => {
      acc[status] = filteredLeads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<FlowAssistMarket.LeadStatus, FlowAssistMarket.Lead[]>
  );
  void _leadsByStatus; // Suppress unused warning

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Pipeline Leadów</h1>
          <p className="text-sm text-slate-500 sm:text-base">
            Zarządzaj potencjalnymi klientami do automatyzacji
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
            {radar.leads.filter((l) => l.automationReadiness === 'hot').length} Hot Leads
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj firmy lub tagów..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:py-3 sm:pl-12"
          />
        </div>

        {/* Mobile Filter Dropdown */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {statusFilter === 'all' ? 'Wszystkie' : statusLabels[statusFilter]}
            </div>
            <ChevronDown
              className={cn('h-4 w-4 text-slate-400 transition-transform', showFilterDropdown && 'rotate-180')}
            />
          </button>
          {showFilterDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-all',
                    statusFilter === 'all' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  Wszystkie
                </button>
                {(Object.keys(statusLabels) as FlowAssistMarket.LeadStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-all',
                      statusFilter === status
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop Filters */}
        <div className="hidden items-center gap-2 overflow-x-auto pb-2 sm:flex sm:pb-0">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Wszystkie
          </button>
          {(Object.keys(statusLabels) as FlowAssistMarket.LeadStatus[]).slice(0, 4).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => {
          const ReadinessIcon = readinessIcons[lead.automationReadiness];
          return (
            <div
              key={lead.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 sm:h-12 sm:w-12">
                    <Building2 className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {lead.companyName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[lead.status])}>
                        {statusLabels[lead.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ReadinessIcon className={cn('h-5 w-5', readinessColors[lead.automationReadiness])} />
                  <span className={cn('text-lg font-bold', getScoreColor(lead.score))}>{lead.score}</span>
                </div>
              </div>

              {lead.industry && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Globe className="h-4 w-4" />
                  {lead.industry}
                  {lead.size && <span className="text-slate-300">•</span>}
                  {lead.size && <span className="capitalize">{lead.size}</span>}
                </div>
              )}

              {lead.notes && (
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{lead.notes}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-1">
                {lead.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(lead.detectedAt).toLocaleDateString('pl-PL')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-emerald-100 hover:text-emerald-600"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Users className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak leadów</h3>
          <p className="mt-1 text-sm text-slate-500">Przejdź do Sygnałów, aby utworzyć nowe leady</p>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Building2 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedLead.companyName}</h2>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[selectedLead.status])}>
                    {statusLabels[selectedLead.status]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Score</p>
                <p className={cn('text-xl font-bold', getScoreColor(selectedLead.score))}>
                  {selectedLead.score}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Gotowość</p>
                <p className="text-xl font-bold capitalize text-slate-900">{selectedLead.automationReadiness}</p>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">Notatki</label>
                <p className="text-sm text-slate-600">{selectedLead.notes}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-slate-700">Zmień status</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusLabels) as FlowAssistMarket.LeadStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedLead.id, status)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      selectedLead.status === status ? statusColors[status] : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {selectedLead.website && (
                <a
                  href={selectedLead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Odwiedź stronę
                </a>
              )}
              <button
                onClick={() => {
                  deleteLead(selectedLead.id);
                  setSelectedLead(null);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
