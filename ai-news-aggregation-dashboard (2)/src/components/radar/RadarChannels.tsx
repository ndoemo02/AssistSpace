import { useState } from 'react';
import {
  Link2,
  Plus,
  Youtube,
  Linkedin,
  Twitter,
  Users,
  Power,
  Trash2,
  ExternalLink,
  X,
  Search,
  Radio,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { FlowAssistMarket } from '@/types';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z" />
  </svg>
);

const platformIcons: Record<FlowAssistMarket.TrackedChannel['platform'], React.ElementType> = {
  youtube: Youtube,
  reddit: () => <RedditIcon />,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Users,
};

const platformColors: Record<FlowAssistMarket.TrackedChannel['platform'], string> = {
  youtube: 'text-red-500 bg-red-50',
  reddit: 'text-orange-500 bg-orange-50',
  linkedin: 'text-blue-600 bg-blue-50',
  twitter: 'text-sky-500 bg-sky-50',
  facebook: 'text-blue-500 bg-blue-50',
};

const platformLabels: Record<FlowAssistMarket.TrackedChannel['platform'], string> = {
  youtube: 'YouTube',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  facebook: 'Facebook',
};

export function RadarChannels() {
  const { radar, addChannel, updateChannel, deleteChannel } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannel, setNewChannel] = useState({
    name: '',
    url: '',
    platform: 'reddit' as FlowAssistMarket.TrackedChannel['platform'],
    isActive: true,
  });

  const handleAddChannel = () => {
    if (!newChannel.name.trim() || !newChannel.url.trim()) return;
    addChannel(newChannel);
    setNewChannel({ name: '', url: '', platform: 'reddit', isActive: true });
    setIsAdding(false);
  };

  const filteredChannels = radar.channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const channelsByPlatform = (Object.keys(platformLabels) as FlowAssistMarket.TrackedChannel['platform'][]).reduce(
    (acc, platform) => {
      acc[platform] = filteredChannels.filter((c) => c.platform === platform);
      return acc;
    },
    {} as Record<FlowAssistMarket.TrackedChannel['platform'], FlowAssistMarket.TrackedChannel[]>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Monitorowane Kanały</h1>
          <p className="text-sm text-slate-500 sm:text-base">Źródła sygnałów rynkowych</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          Dodaj kanał
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj kanałów..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:py-3 sm:pl-12"
        />
      </div>

      {/* Add Channel Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Dodaj nowy kanał</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nazwa</label>
                <input
                  type="text"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  placeholder="np. r/smallbusiness"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">URL</label>
                <input
                  type="url"
                  value={newChannel.url}
                  onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Platforma</label>
                <select
                  value={newChannel.platform}
                  onChange={(e) =>
                    setNewChannel({
                      ...newChannel,
                      platform: e.target.value as FlowAssistMarket.TrackedChannel['platform'],
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  {(Object.keys(platformLabels) as FlowAssistMarket.TrackedChannel['platform'][]).map((platform) => (
                    <option key={platform} value={platform}>
                      {platformLabels[platform]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddChannel}
                disabled={!newChannel.name.trim() || !newChannel.url.trim()}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channels by Platform */}
      {(Object.keys(platformLabels) as FlowAssistMarket.TrackedChannel['platform'][]).map((platform) => {
        const channels = channelsByPlatform[platform];
        if (channels.length === 0) return null;

        const Icon = platformIcons[platform];

        return (
          <div key={platform} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn('rounded-lg p-1.5 sm:p-2', platformColors[platform])}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{platformLabels[platform]}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {channels.length}
              </span>
            </div>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {channels.map((channel) => {
                const ChannelIcon = platformIcons[channel.platform];
                return (
                  <div
                    key={channel.id}
                    className={cn(
                      'group rounded-xl border bg-white p-3 transition-all sm:rounded-2xl sm:p-4',
                      channel.isActive
                        ? 'border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('shrink-0 rounded-lg p-2 sm:rounded-xl sm:p-2.5', platformColors[channel.platform])}>
                        <ChannelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{channel.name}</h3>
                        <p className="truncate text-xs text-slate-500 sm:text-sm">{channel.url}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateChannel(channel.id, { isActive: !channel.isActive })}
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all sm:gap-1.5 sm:px-2.5 sm:py-1.5',
                            channel.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          )}
                        >
                          <Power className="h-3 w-3" />
                          {channel.isActive ? 'Aktywny' : 'Nieaktywny'}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Radio className="h-3 w-3" />
                          {channel.signalsFound} sygnałów
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:p-2"
                        >
                          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </a>
                        <button
                          onClick={() => deleteChannel(channel.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 sm:p-2"
                        >
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

      {filteredChannels.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 sm:rounded-2xl">
          <Link2 className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">Brak kanałów</h3>
          <p className="mt-1 text-sm text-slate-500">Dodaj kanały do monitorowania</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Dodaj kanał
          </button>
        </div>
      )}
    </div>
  );
}
