import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Share2, Bookmark, ArrowRight, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export function NewsFeedView() {
  const { news, projects, assignNewsToProject } = useStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const filteredNews = news.filter(item => {
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['All', 'AI Model', 'Tool', 'Research', 'Industry'];

  return (
    <div className="flex h-full bg-slate-50/50">
      {/* Main Feed */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
           <h1 className="text-2xl font-bold text-slate-900">AI Intelligence Feed</h1>
           <p className="text-slate-500 mt-1">Latest updates, models, and tools relevant to your projects.</p>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  activeFilter === cat 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                     {item.category}
                   </span>
                   <span className="text-xs text-slate-400">{item.date}</span>
                 </div>
                 <div className="flex gap-2">
                   <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                     <Bookmark className="h-4 w-4" />
                   </button>
                   <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                     <Share2 className="h-4 w-4" />
                   </button>
                 </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{item.summary}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-xs font-medium text-slate-500">Source: {item.source}</span>
                
                <div className="relative">
                  {assigningId === item.id ? (
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-10">
                      <p className="text-xs font-semibold text-slate-500 mb-2 px-2">Assign to project:</p>
                      <div className="space-y-1">
                        {projects.map(p => {
                          const isAssigned = p.assignedNewsIds.includes(item.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                assignNewsToProject(item.id, p.id);
                                setAssigningId(null);
                              }}
                              disabled={isAssigned}
                              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-50 flex items-center justify-between disabled:opacity-50"
                            >
                              <span className="truncate">{p.name}</span>
                              {isAssigned && <Check className="h-3 w-3 text-green-500" />}
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        onClick={() => setAssigningId(null)}
                        className="w-full mt-2 text-center text-xs text-slate-400 hover:text-slate-600 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAssigningId(item.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        item.isAssigned
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      )}
                    >
                      {item.isAssigned ? (
                        <>
                          <Check className="h-4 w-4" /> Assigned
                        </>
                      ) : (
                        <>
                          Assign <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Sidebar - Trends or Quick Stats */}
      <div className="w-80 bg-white border-l border-slate-200 p-6 hidden xl:block">
        <h3 className="font-bold text-slate-900 mb-4">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
           {['#LLM', '#ComputerVision', '#Regulations', '#OpenSource', '#RAG', '#Agents'].map(tag => (
             <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-200 cursor-pointer">
               {tag}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
}
