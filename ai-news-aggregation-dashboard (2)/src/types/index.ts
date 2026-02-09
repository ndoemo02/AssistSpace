// ============================================
// FLOWASSIST ECOSYSTEM - TYPE DEFINITIONS
// ============================================

// Workspace Types
export type Workspace = 'assist' | 'radar';

// ============================================
// ASSIST SPACE - Personal Intelligence OS
// ============================================
export namespace AssistPersonal {
  export type Category = 'youtube' | 'reddit' | 'github' | 'articles' | 'tools' | 'research' | 'ideas' | 'learning' | 'uncategorized';

  export interface KnowledgeItem {
    id: string;
    url: string;
    title: string;
    description?: string;
    category: Category;
    source: 'youtube' | 'reddit' | 'github' | 'custom';
    thumbnail?: string;
    addedAt: Date;
    summary?: string;
    tags: string[];
    isFavorite: boolean;
    notes?: string;
  }

  export interface Source {
    id: string;
    name: string;
    url: string;
    type: 'youtube' | 'reddit' | 'github' | 'rss' | 'custom';
    isActive: boolean;
  }

  export interface IdeaNote {
    id: string;
    title: string;
    content: string;
    category: 'product' | 'strategy' | 'tech' | 'research' | 'inspiration';
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    linkedItems: string[];
  }

  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }
}

// ============================================
// FLOWASSIST RADAR - Market Intelligence OS
// ============================================
export namespace FlowAssistMarket {
  export type SignalSource = 'youtube_comments' | 'reddit_post' | 'linkedin' | 'twitter' | 'facebook_group' | 'facebook' | 'instagram' | 'tiktok' | 'custom';
  export type LeadStatus = 'detected' | 'qualified' | 'researched' | 'outreach_ready' | 'contacted' | 'archived';
  export type AutomationReadiness = 'hot' | 'warm' | 'cold' | 'not_ready';

  export interface Lead {
    id: string;
    companyName: string;
    website?: string;
    industry?: string;
    size?: 'startup' | 'small' | 'medium' | 'enterprise';
    status: LeadStatus;
    automationReadiness: AutomationReadiness;
    score: number; // 0-100
    detectedAt: Date;
    lastUpdated: Date;
    signals: Signal[];
    notes: string;
    tags: string[];
  }

  export interface Signal {
    id: string;
    leadId: string;
    source: SignalSource;
    sourceUrl: string;
    content: string;
    painPoints: string[];
    sentiment: 'negative' | 'neutral' | 'positive';
    automationOpportunity: string;
    detectedAt: Date;
    relevanceScore: number; // 0-100
  }

  export interface TrackedChannel {
    id: string;
    name: string;
    platform: 'youtube' | 'reddit' | 'linkedin' | 'twitter' | 'facebook';
    url: string;
    isActive: boolean;
    lastScanned?: Date;
    signalsFound: number;
  }

  export interface OutreachTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    tags: string[];
    usageCount: number;
  }
}

// ============================================
// FUTURE EXPANSION - FlowAssist Ops
// ============================================
export namespace FlowAssistOps {
  export interface Client {
    id: string;
    name: string;
    status: 'active' | 'onboarding' | 'churned';
    // ... to be expanded
  }

  export interface Deployment {
    id: string;
    clientId: string;
    status: 'planning' | 'development' | 'testing' | 'live';
    // ... to be expanded
  }
}
