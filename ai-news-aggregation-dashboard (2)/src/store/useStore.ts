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
  fetchLeads: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// SAMPLE DATA - ASSIST SPACE
// ============================================
const sampleKnowledgeItems: AssistPersonal.KnowledgeItem[] = [];

const defaultSources: AssistPersonal.Source[] = [
  { id: generateId(), name: 'AI Explained', url: 'https://youtube.com/@aiexplained', type: 'youtube', isActive: true },
  { id: generateId(), name: 'r/MachineLearning', url: 'https://reddit.com/r/MachineLearning', type: 'reddit', isActive: true },
  { id: generateId(), name: 'r/LocalLLaMA', url: 'https://reddit.com/r/LocalLLaMA', type: 'reddit', isActive: true },
  { id: generateId(), name: 'Hugging Face', url: 'https://github.com/huggingface', type: 'github', isActive: true },
];

// ============================================
// SAMPLE DATA - RADAR
// ============================================
const sampleLeads: FlowAssistMarket.Lead[] = [];

const sampleSignals: FlowAssistMarket.Signal[] = [];

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

      fetchLeads: async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('score', { ascending: false });

          if (error) {
            console.error('Error fetching leads:', error);
            return;
          }

          if (data) {
            const mappedLeads: FlowAssistMarket.Lead[] = data.map((item: any) => ({
              id: item.id,
              companyName: item.company_name,
              website: item.website,
              industry: item.industry,
              size: (item.size || 'small') as 'small' | 'medium' | 'enterprise' | 'startup',
              status: (item.status || 'detected') as FlowAssistMarket.LeadStatus,
              automationReadiness: (item.automation_readiness || 'warm') as FlowAssistMarket.AutomationReadiness,
              score: item.score || 0,
              detectedAt: new Date(item.detected_at),
              lastUpdated: new Date(item.last_updated),
              signals: [], // Will be populated below if available
              notes: item.notes || '',
              tags: item.tags || [],
            }));

            // Flatten signals from all leads for the Signal Scanner
            const allSignals: FlowAssistMarket.Signal[] = [];
            data.forEach((item: any, index: number) => {
              const lead = mappedLeads[index];
              const rawSignals = item.signals;
              const contactInfo = item.contact_info || {};

              if (rawSignals && Array.isArray(rawSignals) && rawSignals.length > 0) {
                const mappedSignals = rawSignals.map((s: any) => ({
                  id: s.id || Math.random().toString(36).substring(2, 9),
                  leadId: lead.id,
                  source: (lead.tags.includes('instagram') ? 'instagram' : 'custom') as FlowAssistMarket.SignalSource,
                  sourceUrl: contactInfo.url || lead.website || '',
                  content: typeof s === 'string' ? s : (s.text || s.content || "Brak treści komentarza"),
                  painPoints: [typeof s === 'string' ? 'General' : (s.category || 'General')].filter(Boolean),
                  sentiment: 'negative' as const,
                  automationOpportunity: item.notes || lead.notes || "Potencjalna automatyzacja obsługi klienta",
                  detectedAt: lead.detectedAt,
                  relevanceScore: lead.score
                }));

                lead.signals = mappedSignals;
                allSignals.push(...mappedSignals);
              } else if (lead.score >= 10) {
                // Fallback signal for high-relevance leads without detailed comments
                allSignals.push({
                  id: `syn-${lead.id}`,
                  leadId: lead.id,
                  source: (lead.tags.includes('instagram') ? 'instagram' : 'custom') as FlowAssistMarket.SignalSource,
                  sourceUrl: contactInfo.url || lead.website || '',
                  content: lead.notes || "Wykryto wysoką istotność biznesową na podstawie profilu i treści postów.",
                  painPoints: lead.tags.length > 0 ? lead.tags : ['general'],
                  sentiment: 'neutral',
                  automationOpportunity: "Analiza wzorców aktywności sugeruje potencjał dla automatyzacji procesów.",
                  detectedAt: lead.detectedAt,
                  relevanceScore: lead.score
                });
              }
            });

            set((state) => ({
              radar: {
                ...state.radar,
                leads: mappedLeads,
                signals: allSignals.length > 0 ? allSignals : state.radar.signals
              },
            }));
          }
        } catch (err) {
          console.error('Fetch leads exception:', err);
        }
      },
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
