import type { Project } from '../../types/project';
import { statusConfig, priorityConfig } from '../../types/project';
import { AvatarGroup } from '../shared/Avatar';
import { Badge } from '../shared/Badge';

interface ProjectCardProps {
  project: Project;
  members: Array<{ name: string; avatar?: string }>;
  onClick?: () => void;
}

export function ProjectCard({ project, members, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed';
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-5
                border border-slate-200 dark:border-slate-700
                hover:shadow-lg dark:hover:shadow-slate-900/50
                hover:border-indigo-300 dark:hover:border-indigo-700
                transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm ${priority.color}`}>
                {priority.icon} {priority.label}
              </span>
            </div>
          </div>
        </div>
        <Badge 
          variant={project.status === 'active' ? 'success' : project.status === 'on-hold' ? 'warning' : 'default'}
          size="sm"
        >
          {status.label}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-medium text-slate-900 dark:text-white">{project.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${project.progress}%`,
              background: `linear-gradient(90deg, ${project.color}, ${project.color}dd)`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <AvatarGroup members={members} max={3} size="xs" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {project.completedTasks}/{project.totalTasks} tasks
          </span>
        </div>
        
        {project.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(project.dueDate)}</span>
            {isOverdue && <span className="font-medium">(Overdue)</span>}
          </div>
        )}
      </div>
    </button>
  );
}
