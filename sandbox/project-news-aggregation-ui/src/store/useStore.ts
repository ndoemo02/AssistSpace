import { create } from 'zustand';

export type ProjectStatus = 'Active' | 'Planning' | 'Completed' | 'On Hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  tags: string[];
  assignedNewsIds: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  date: string;
  category: 'AI Model' | 'Tool' | 'Research' | 'Industry';
  isAssigned: boolean;
}

export interface BrainstormNote {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
}

interface AppState {
  projects: Project[];
  news: NewsItem[];
  brainstormNotes: BrainstormNote[];
  
  addProject: (project: Project) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  assignNewsToProject: (newsId: string, projectId: string) => void;
  addBrainstormNote: (note: BrainstormNote) => void;
  updateBrainstormNotePosition: (id: string, x: number, y: number) => void;
  deleteBrainstormNote: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  projects: [
    {
      id: 'p1',
      name: 'NeuroFlow Analytics',
      description: 'AI-driven customer behavior analysis platform.',
      status: 'Active',
      progress: 65,
      tags: ['SaaS', 'AI', 'Analytics'],
      assignedNewsIds: ['n1']
    },
    {
      id: 'p2',
      name: 'GreenTech Monitor',
      description: 'IoT dashboard for agricultural sensors.',
      status: 'Planning',
      progress: 15,
      tags: ['IoT', 'GreenTech'],
      assignedNewsIds: []
    },
    {
      id: 'p3',
      name: 'CyberGuard Sentinel',
      description: 'Automated threat detection system.',
      status: 'Active',
      progress: 82,
      tags: ['Security', 'ML'],
      assignedNewsIds: ['n3']
    }
  ],
  news: [
    {
      id: 'n1',
      title: 'GPT-5 Rumors & Expected Capabilities',
      source: 'TechCrunch',
      summary: 'Speculation grows around the reasoning capabilities of the next generation model.',
      date: '2023-10-24',
      category: 'AI Model',
      isAssigned: true
    },
    {
      id: 'n2',
      title: 'New Vector Database benchmarks',
      source: 'Pinecone Blog',
      summary: 'Performance comparison of top vector DBs for RAG applications.',
      date: '2023-10-23',
      category: 'Tool',
      isAssigned: false
    },
    {
      id: 'n3',
      title: 'Llama 3 Fine-tuning strategies',
      source: 'HuggingFace',
      summary: 'Optimizing open source models for specific domain tasks.',
      date: '2023-10-22',
      category: 'Research',
      isAssigned: true
    },
    {
      id: 'n4',
      title: 'AI Act finalized in EU',
      source: 'Reuters',
      summary: 'New regulations impacting generative AI deployment in Europe.',
      date: '2023-10-21',
      category: 'Industry',
      isAssigned: false
    }
  ],
  brainstormNotes: [
    { id: 'b1', content: 'Integrate Speech-to-Text', x: 100, y: 100, color: 'bg-yellow-200' },
    { id: 'b2', content: 'Check new OpenAI API pricing', x: 300, y: 150, color: 'bg-blue-200' },
  ],

  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  
  updateProjectStatus: (id, status) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, status } : p)
  })),

  assignNewsToProject: (newsId, projectId) => set((state) => {
    // 1. Add newsId to project
    const updatedProjects = state.projects.map(p => {
      if (p.id === projectId && !p.assignedNewsIds.includes(newsId)) {
        return { ...p, assignedNewsIds: [...p.assignedNewsIds, newsId] };
      }
      return p;
    });

    // 2. Mark news as assigned (optional, if we want to hide assigned ones or mark them)
    const updatedNews = state.news.map(n => n.id === newsId ? { ...n, isAssigned: true } : n);

    return { projects: updatedProjects, news: updatedNews };
  }),

  addBrainstormNote: (note) => set((state) => ({ brainstormNotes: [...state.brainstormNotes, note] })),
  
  updateBrainstormNotePosition: (id, x, y) => set((state) => ({
    brainstormNotes: state.brainstormNotes.map(n => n.id === id ? { ...n, x, y } : n)
  })),

  deleteBrainstormNote: (id) => set((state) => ({
    brainstormNotes: state.brainstormNotes.filter(n => n.id !== id)
  })),
}));
