import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, AssistPersonal, FlowAssistMarket } from '@/types';

// ============================================
// APP STATE INTERFACE
// ============================================
interface AppState {
  // Global State
  currentWorkspace: Workspace;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isRightPanelOpen: boolean;

  // ==========================================
  // ASSIST SPACE (Personal Intelligence)
  // ==========================================
  assist: {
    activeTab: 'dashboard' | 'moodboard' | 'ideas' | 'sources' | 'saved' | 'ai-chat';
    knowledgeItems: AssistPersonal.KnowledgeItem[];
    sources: AssistPersonal.Source[];
    ideas: AssistPersonal.IdeaNote[];
    chatMessages: AssistPersonal.ChatMessage[];
  };

  // ==========================================
  // FLOWASSIST RADAR (Market Intelligence)
  // ==========================================
  radar: {
    activeTab: 'signals' | 'leads' | 'channels' | 'outreach' | 'analytics';
    leads: FlowAssistMarket.Lead[];
    signals: FlowAssistMarket.Signal[];
    channels: FlowAssistMarket.TrackedChannel[];
    templates: FlowAssistMarket.OutreachTemplate[];
  };

  // ==========================================
  // GLOBAL ACTIONS
  // ==========================================
  setWorkspace: (workspace: Workspace) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  toggleRightPanel: () => void;

  // ==========================================
  // ASSIST SPACE ACTIONS
  // ==========================================
  setAssistTab: (tab: AppState['assist']['activeTab']) => void;
  addKnowledgeItem: (item: Omit<AssistPersonal.KnowledgeItem, 'id' | 'addedAt'>) => void;
  updateKnowledgeItem: (id: string, updates: Partial<AssistPersonal.KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
  moveToCategory: (id: string, category: AssistPersonal.Category) => void;
  toggleFavorite: (id: string) => void;
  addSource: (source: Omit<AssistPersonal.Source, 'id'>) => void;
  updateSource: (id: string, updates: Partial<AssistPersonal.Source>) => void;
  deleteSource: (id: string) => void;
  addIdea: (idea: Omit<AssistPersonal.IdeaNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIdea: (id: string, updates: Partial<AssistPersonal.IdeaNote>) => void;
  deleteIdea: (id: string) => void;
  addAssistChatMessage: (message: Omit<AssistPersonal.ChatMessage, 'id' | 'timestamp'>) => void;
  clearAssistChat: () => void;

  // ==========================================
  // RADAR ACTIONS
  // ==========================================
  setRadarTab: (tab: AppState['radar']['activeTab']) => void;
  addLead: (lead: Omit<FlowAssistMarket.Lead, 'id' | 'detectedAt' | 'lastUpdated'>) => void;
  updateLead: (id: string, updates: Partial<FlowAssistMarket.Lead>) => void;
  deleteLead: (id: string) => void;
  addSignal: (signal: Omit<FlowAssistMarket.Signal, 'id' | 'detectedAt'>) => void;
  addChannel: (channel: Omit<FlowAssistMarket.TrackedChannel, 'id' | 'signalsFound'>) => void;
  updateChannel: (id: string, updates: Partial<FlowAssistMarket.TrackedChannel>) => void;
  deleteChannel: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// SAMPLE DATA - ASSIST SPACE
// ============================================
const sampleKnowledgeItems: AssistPersonal.KnowledgeItem[] = [
  {
    id: generateId(),
    url: 'https://www.youtube.com/watch?v=example1',
    title: 'GPT-5 Rumors: What We Know So Far',
    description: 'Deep dive into the latest GPT-5 speculation and features',
    category: 'youtube',
    source: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    addedAt: new Date(),
    tags: ['gpt', 'openai', 'llm'],
    isFavorite: true,
  },
  {
    id: generateId(),
    url: 'https://reddit.com/r/MachineLearning/example',
    title: 'New SOTA in Image Generation - Community Discussion',
    description: 'r/MachineLearning discusses the latest breakthrough',
    category: 'reddit',
    source: 'reddit',
    addedAt: new Date(),
    tags: ['image-gen', 'diffusion'],
    isFavorite: false,
  },
  {
    id: generateId(),
    url: 'https://github.com/example/ai-tool',
    title: 'Open Source Alternative to Claude Artifacts',
    description: 'A new open-source project gaining traction',
    category: 'github',
    source: 'github',
    addedAt: new Date(),
    tags: ['open-source', 'tools'],
    isFavorite: true,
  },
];

const defaultSources: AssistPersonal.Source[] = [
  { id: generateId(), name: 'AI Explained', url: 'https://youtube.com/@aiexplained', type: 'youtube', isActive: true },
  { id: generateId(), name: 'r/MachineLearning', url: 'https://reddit.com/r/MachineLearning', type: 'reddit', isActive: true },
  { id: generateId(), name: 'r/LocalLLaMA', url: 'https://reddit.com/r/LocalLLaMA', type: 'reddit', isActive: true },
  { id: generateId(), name: 'Hugging Face', url: 'https://github.com/huggingface', type: 'github', isActive: true },
];

// ============================================
// SAMPLE DATA - RADAR
// ============================================
const sampleLeads: FlowAssistMarket.Lead[] = [
  {
    id: generateId(),
    companyName: 'TechStartup Sp. z o.o.',
    website: 'https://techstartup.pl',
    industry: 'E-commerce',
    size: 'small',
    status: 'qualified',
    automationReadiness: 'hot',
    score: 85,
    detectedAt: new Date(Date.now() - 86400000 * 2),
    lastUpdated: new Date(),
    signals: [],
    notes: 'Mają problem z obsługą klienta - potrzebują chatbota',
    tags: ['ecommerce', 'chatbot', 'customer-service'],
  },
  {
    id: generateId(),
    companyName: 'Marketing Agency XYZ',
    website: 'https://marketingxyz.com',
    industry: 'Marketing',
    size: 'medium',
    status: 'detected',
    automationReadiness: 'warm',
    score: 65,
    detectedAt: new Date(Date.now() - 86400000),
    lastUpdated: new Date(),
    signals: [],
    notes: 'Narzekają na ręczne raportowanie w komentarzach',
    tags: ['marketing', 'automation', 'reporting'],
  },
  {
    id: generateId(),
    companyName: 'Logistyka Pro',
    website: 'https://logistykapro.pl',
    industry: 'Logistics',
    size: 'medium',
    status: 'researched',
    automationReadiness: 'warm',
    score: 72,
    detectedAt: new Date(Date.now() - 86400000 * 5),
    lastUpdated: new Date(),
    signals: [],
    notes: 'Szukają rozwiązania do automatyzacji faktur',
    tags: ['logistics', 'invoicing', 'automation'],
  },
];

const sampleSignals: FlowAssistMarket.Signal[] = [
  {
    id: generateId(),
    leadId: '',
    source: 'youtube_comments',
    sourceUrl: 'https://youtube.com/watch?v=abc123',
    content: '"Mamy 50 pracowników i nadal wszystko robimy w Excelu. To koszmar!"',
    painPoints: ['manual-processes', 'excel-dependency', 'scaling-issues'],
    sentiment: 'negative',
    automationOpportunity: 'Automatyzacja procesów backoffice, integracja systemów',
    detectedAt: new Date(Date.now() - 3600000 * 2),
    relevanceScore: 88,
  },
  {
    id: generateId(),
    leadId: '',
    source: 'reddit_post',
    sourceUrl: 'https://reddit.com/r/smallbusiness/comments/xyz',
    content: 'Szukamy kogoś kto pomoże zautomatyzować nasz proces onboardingu klientów...',
    painPoints: ['onboarding', 'manual-work', 'time-consuming'],
    sentiment: 'neutral',
    automationOpportunity: 'Workflow automation dla onboardingu, automatyczne maile',
    detectedAt: new Date(Date.now() - 3600000 * 5),
    relevanceScore: 92,
  },
  {
    id: generateId(),
    leadId: '',
    source: 'linkedin',
    sourceUrl: 'https://linkedin.com/posts/xyz',
    content: 'Nasz zespół spędza 20h tygodniowo na ręcznym wprowadzaniu danych...',
    painPoints: ['data-entry', 'time-waste', 'human-error'],
    sentiment: 'negative',
    automationOpportunity: 'RPA, automatyzacja wprowadzania danych, AI extraction',
    detectedAt: new Date(Date.now() - 3600000 * 8),
    relevanceScore: 95,
  },
];

const sampleChannels: FlowAssistMarket.TrackedChannel[] = [
  { id: generateId(), name: 'r/smallbusiness', platform: 'reddit', url: 'https://reddit.com/r/smallbusiness', isActive: true, signalsFound: 24 },
  { id: generateId(), name: 'r/Entrepreneur', platform: 'reddit', url: 'https://reddit.com/r/Entrepreneur', isActive: true, signalsFound: 18 },
  { id: generateId(), name: 'Polish Startups', platform: 'facebook', url: 'https://facebook.com/groups/polishstartups', isActive: true, signalsFound: 12 },
  { id: generateId(), name: 'Automation & AI for Business', platform: 'youtube', url: 'https://youtube.com/@automationai', isActive: false, signalsFound: 8 },
];

// ============================================
// STORE IMPLEMENTATION
// ============================================
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Global State
      currentWorkspace: 'assist',
      isSidebarOpen: false,
      isSidebarCollapsed: false,
      isRightPanelOpen: false,

      // Assist Space
      assist: {
        activeTab: 'dashboard',
        knowledgeItems: sampleKnowledgeItems,
        sources: defaultSources,
        ideas: [],
        chatMessages: [],
      },

      // Radar
      radar: {
        activeTab: 'signals',
        leads: sampleLeads,
        signals: sampleSignals,
        channels: sampleChannels,
        templates: [],
      },

      // ==========================================
      // GLOBAL ACTIONS
      // ==========================================
      setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

      // ==========================================
      // ASSIST SPACE ACTIONS
      // ==========================================
      setAssistTab: (tab) =>
        set((state) => ({
          assist: { ...state.assist, activeTab: tab },
        })),

      addKnowledgeItem: (item) =>
        set((state) => ({
          assist: {
            ...state.assist,
            knowledgeItems: [
              ...state.assist.knowledgeItems,
              { ...item, id: generateId(), addedAt: new Date() },
            ],
          },
        })),

      updateKnowledgeItem: (id, updates) =>
        set((state) => ({
          assist: {
            ...state.assist,
            knowledgeItems: state.assist.knowledgeItems.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),

      deleteKnowledgeItem: (id) =>
        set((state) => ({
          assist: {
            ...state.assist,
            knowledgeItems: state.assist.knowledgeItems.filter((item) => item.id !== id),
          },
        })),

      moveToCategory: (id, category) =>
        set((state) => ({
          assist: {
            ...state.assist,
            knowledgeItems: state.assist.knowledgeItems.map((item) =>
              item.id === id ? { ...item, category } : item
            ),
          },
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          assist: {
            ...state.assist,
            knowledgeItems: state.assist.knowledgeItems.map((item) =>
              item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            ),
          },
        })),

      addSource: (source) =>
        set((state) => ({
          assist: {
            ...state.assist,
            sources: [...state.assist.sources, { ...source, id: generateId() }],
          },
        })),

      updateSource: (id, updates) =>
        set((state) => ({
          assist: {
            ...state.assist,
            sources: state.assist.sources.map((source) =>
              source.id === id ? { ...source, ...updates } : source
            ),
          },
        })),

      deleteSource: (id) =>
        set((state) => ({
          assist: {
            ...state.assist,
            sources: state.assist.sources.filter((source) => source.id !== id),
          },
        })),

      addIdea: (idea) =>
        set((state) => ({
          assist: {
            ...state.assist,
            ideas: [
              ...state.assist.ideas,
              {
                ...idea,
                id: generateId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          },
        })),

      updateIdea: (id, updates) =>
        set((state) => ({
          assist: {
            ...state.assist,
            ideas: state.assist.ideas.map((idea) =>
              idea.id === id ? { ...idea, ...updates, updatedAt: new Date() } : idea
            ),
          },
        })),

      deleteIdea: (id) =>
        set((state) => ({
          assist: {
            ...state.assist,
            ideas: state.assist.ideas.filter((idea) => idea.id !== id),
          },
        })),

      addAssistChatMessage: (message) =>
        set((state) => ({
          assist: {
            ...state.assist,
            chatMessages: [
              ...state.assist.chatMessages,
              { ...message, id: generateId(), timestamp: new Date() },
            ],
          },
        })),

      clearAssistChat: () =>
        set((state) => ({
          assist: { ...state.assist, chatMessages: [] },
        })),

      // ==========================================
      // RADAR ACTIONS
      // ==========================================
      setRadarTab: (tab) =>
        set((state) => ({
          radar: { ...state.radar, activeTab: tab },
        })),

      addLead: (lead) =>
        set((state) => ({
          radar: {
            ...state.radar,
            leads: [
              ...state.radar.leads,
              {
                ...lead,
                id: generateId(),
                detectedAt: new Date(),
                lastUpdated: new Date(),
              },
            ],
          },
        })),

      updateLead: (id, updates) =>
        set((state) => ({
          radar: {
            ...state.radar,
            leads: state.radar.leads.map((lead) =>
              lead.id === id ? { ...lead, ...updates, lastUpdated: new Date() } : lead
            ),
          },
        })),

      deleteLead: (id) =>
        set((state) => ({
          radar: {
            ...state.radar,
            leads: state.radar.leads.filter((lead) => lead.id !== id),
          },
        })),

      addSignal: (signal) =>
        set((state) => ({
          radar: {
            ...state.radar,
            signals: [
              ...state.radar.signals,
              { ...signal, id: generateId(), detectedAt: new Date() },
            ],
          },
        })),

      addChannel: (channel) =>
        set((state) => ({
          radar: {
            ...state.radar,
            channels: [
              ...state.radar.channels,
              { ...channel, id: generateId(), signalsFound: 0 },
            ],
          },
        })),

      updateChannel: (id, updates) =>
        set((state) => ({
          radar: {
            ...state.radar,
            channels: state.radar.channels.map((channel) =>
              channel.id === id ? { ...channel, ...updates } : channel
            ),
          },
        })),

      deleteChannel: (id) =>
        set((state) => ({
          radar: {
            ...state.radar,
            channels: state.radar.channels.filter((channel) => channel.id !== id),
          },
        })),
    }),
    {
      name: 'flowassist-storage',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        assist: {
          knowledgeItems: state.assist.knowledgeItems,
          sources: state.assist.sources,
          ideas: state.assist.ideas,
        },
        radar: {
          leads: state.radar.leads,
          signals: state.radar.signals,
          channels: state.radar.channels,
          templates: state.radar.templates,
        },
      }),
    }
  )
);
