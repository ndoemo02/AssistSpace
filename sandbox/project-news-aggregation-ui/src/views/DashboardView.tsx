import { useStore, Project } from '../store/useStore';
import { MoreHorizontal, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

export function DashboardView() {
  const { projects } = useStore();

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-slate-50/50">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Overview</h1>
          <p className="text-slate-500 mt-1">Monitor progress and integrate AI updates.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Active Projects: {projects.filter(p => p.status === 'Active').length}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    'Active': 'bg-green-100 text-green-700',
    'Planning': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-slate-100 text-slate-700',
    'On Hold': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
      <div className="flex items-start justify-between mb-4">
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusColors[project.status])}>
          {project.status}
        </span>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{project.description}</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className="text-indigo-600 font-bold">{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                    U{i}
                 </div>
              ))}
           </div>
           
           <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
             <Zap className="w-3.5 h-3.5 text-amber-500" />
             {project.assignedNewsIds.length} Updates
           </div>
        </div>
      </div>
    </div>
  );
}
