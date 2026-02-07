import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { NewsFeedView } from './views/NewsFeedView';
import { BrainstormView } from './views/BrainstormView';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'brainstorm'>('dashboard');

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-screen overflow-hidden">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'news' && <NewsFeedView />}
        {activeTab === 'brainstorm' && <BrainstormView />}
      </main>
    </div>
  );
}
