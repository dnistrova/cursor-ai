import type { Project, ProjectStats } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { Card, CardHeader, StatCard } from '../shared/Card';

interface ProjectOverviewProps {
  projects: Project[];
  stats: ProjectStats;
  members: Record<string, Array<{ name: string; avatar?: string }>>;
  onProjectClick?: (project: Project) => void;
  onViewAll?: () => void;
  loading?: boolean;
}

export function ProjectOverview({ 
  projects, 
  stats, 
  members,
  onProjectClick,
  onViewAll,
  loading = false 
}: ProjectOverviewProps) {
  const activeProjects = projects.filter(p => p.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsGrid stats={stats} loading />
        <Card>
          <CardHeader title="Active Projects" subtitle="Loading..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-100 dark:bg-slate-700 rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Active Projects */}
      <Card>
        <CardHeader
          title="Active Projects"
          subtitle={`${activeProjects.length} projects in progress`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          action={
            onViewAll && (
              <button 
                onClick={onViewAll}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 
                         hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View all
              </button>
            )
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.slice(0, 4).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              members={members[project.id] || []}
              onClick={() => onProjectClick?.(project)}
            />
          ))}
        </div>

        {activeProjects.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              No active projects
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Create your first project to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

interface StatsGridProps {
  stats: ProjectStats;
  loading?: boolean;
}

function StatsGrid({ stats, loading = false }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Projects"
        value={stats.totalProjects}
        change={12}
        trend="up"
        changeLabel="vs last month"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
      />
      
      <StatCard
        title="Active Projects"
        value={stats.activeProjects}
        change={8}
        trend="up"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />
      
      <StatCard
        title="Tasks Completed"
        value={stats.tasksCompletedThisWeek}
        change={24}
        trend="up"
        changeLabel="this week"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <StatCard
        title="Overdue Tasks"
        value={stats.overdueTasks}
        change={stats.overdueTasks > 0 ? 5 : 0}
        trend={stats.overdueTasks > 0 ? 'down' : 'neutral'}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}

interface ProjectListProps {
  projects: Project[];
  members: Record<string, Array<{ name: string; avatar?: string }>>;
  onProjectClick?: (project: Project) => void;
  emptyMessage?: string;
}

export function ProjectList({ 
  projects, 
  members, 
  onProjectClick,
  emptyMessage = 'No projects found'
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          members={members[project.id] || []}
          onClick={() => onProjectClick?.(project)}
        />
      ))}
    </div>
  );
}


