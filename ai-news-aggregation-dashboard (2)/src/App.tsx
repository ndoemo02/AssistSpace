import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';

// Assist Space Components
import { AssistDashboard } from '@/components/assist/AssistDashboard';
import { AssistMoodboard } from '@/components/assist/AssistMoodboard';
import { AssistIdeas } from '@/components/assist/AssistIdeas';
import { AssistSources } from '@/components/assist/AssistSources';
import { AssistSaved } from '@/components/assist/AssistSaved';
import { AssistAIChat } from '@/components/assist/AssistAIChat';
import { AssistAgent } from '@/components/assist/AssistAgent';

// Radar Components
import { SignalScanner } from '@/components/radar/SignalScanner';
import { LeadsPipeline } from '@/components/radar/LeadsPipeline';
import { RadarChannels } from '@/components/radar/RadarChannels';
import { RadarAnalytics } from '@/components/radar/RadarAnalytics';

// Placeholder for Outreach
function RadarOutreach() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Outreach</h2>
        <p className="mt-2 text-slate-600">Moduł w przygotowaniu</p>
        <p className="mt-4 text-sm text-slate-500">
          Tu będziesz zarządzać szablonami wiadomości i kampaniami outreach
        </p>
      </div>
    </div>
  );
}

export function App() {
  const { currentWorkspace, assist, radar, isSidebarCollapsed } = useStore();

  const renderAssistContent = () => {
    switch (assist.activeTab) {
      case 'dashboard':
        return <AssistDashboard />;
      case 'moodboard':
        return <AssistMoodboard />;
      case 'ideas':
        return <AssistIdeas />;
      case 'sources':
        return <AssistSources />;
      case 'saved':
        return <AssistSaved />;
      case 'ai-chat':
        return <AssistAIChat />;
      case 'agent':
        return <AssistAgent />;
      default:
        return <AssistDashboard />;
    }
  };

  const renderRadarContent = () => {
    switch (radar.activeTab) {
      case 'signals':
        return <SignalScanner />;
      case 'leads':
        return <LeadsPipeline />;
      case 'channels':
        return <RadarChannels />;
      case 'outreach':
        return <RadarOutreach />;
      case 'analytics':
        return <RadarAnalytics />;
      default:
        return <SignalScanner />;
    }
  };

  const isAssist = currentWorkspace === 'assist';

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        isAssist
          ? 'bg-gradient-to-br from-slate-50 via-white to-violet-50'
          : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'
      )}
    >
      <Sidebar />
      <main
        className={cn(
          'min-h-screen p-4 pt-20 transition-all duration-300',
          'sm:p-6 sm:pt-20',
          'lg:pt-8 lg:p-8',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        )}
      >
        {isAssist ? renderAssistContent() : renderRadarContent()}
      </main>
    </div>
  );
}
