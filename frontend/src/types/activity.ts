/**
 * Activity Feed Types
 */

export type ActivityType = 
  | 'task_created'
  | 'task_completed'
  | 'task_assigned'
  | 'task_commented'
  | 'project_created'
  | 'project_updated'
  | 'member_joined'
  | 'member_left'
  | 'file_uploaded'
  | 'deadline_updated'
  | 'status_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  targetUserId?: string;
  targetUserName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface ActivityGroup {
  date: string;
  activities: Activity[];
}

export const activityIcons: Record<ActivityType, { icon: string; color: string; bg: string }> = {
  task_created: {
    icon: '➕',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  task_completed: {
    icon: '✓',
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  task_assigned: {
    icon: '→',
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  task_commented: {
    icon: '💬',
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  project_created: {
    icon: '🚀',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  project_updated: {
    icon: '✏️',
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  member_joined: {
    icon: '👋',
    color: 'text-teal-600',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
  },
  member_left: {
    icon: '👤',
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  file_uploaded: {
    icon: '📎',
    color: 'text-cyan-600',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  deadline_updated: {
    icon: '📅',
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
  status_changed: {
    icon: '🔄',
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
};

export function getActivityMessage(activity: Activity): string {
  switch (activity.type) {
    case 'task_created':
      return `created task "${activity.taskName}"`;
    case 'task_completed':
      return `completed "${activity.taskName}"`;
    case 'task_assigned':
      return `assigned "${activity.taskName}" to ${activity.targetUserName}`;
    case 'task_commented':
      return `commented on "${activity.taskName}"`;
    case 'project_created':
      return `created project "${activity.projectName}"`;
    case 'project_updated':
      return `updated project "${activity.projectName}"`;
    case 'member_joined':
      return `joined the team`;
    case 'member_left':
      return `left the team`;
    case 'file_uploaded':
      return `uploaded a file to "${activity.taskName || activity.projectName}"`;
    case 'deadline_updated':
      return `updated deadline for "${activity.taskName}"`;
    case 'status_changed':
      return `changed status of "${activity.taskName}"`;
    default:
      return 'performed an action';
  }
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
