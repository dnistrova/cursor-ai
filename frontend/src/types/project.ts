/**
 * Project Types
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number; // 0-100
  startDate: Date;
  dueDate?: Date;
  teamMembers: string[]; // Member IDs
  totalTasks: number;
  completedTasks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueTasks: number;
  tasksCompletedThisWeek: number;
  averageProgress: number;
}

export type ProjectStatus = Project['status'];
export type ProjectPriority = Project['priority'];

export const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active: {
    label: 'Active',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  archived: {
    label: 'Archived',
    color: 'text-slate-700 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
};

export const priorityConfig: Record<ProjectPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: 'text-slate-500', icon: '○' },
  medium: { label: 'Medium', color: 'text-blue-500', icon: '◐' },
  high: { label: 'High', color: 'text-amber-500', icon: '●' },
  urgent: { label: 'Urgent', color: 'text-rose-500', icon: '◉' },
};

export const projectColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];
