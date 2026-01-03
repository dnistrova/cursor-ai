/**
 * Team and Member Types
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'online' | 'away' | 'busy' | 'offline';
  department?: string;
  title?: string;
  tasksCompleted: number;
  tasksAssigned: number;
  lastActive?: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export type MemberRole = TeamMember['role'];
export type MemberStatus = TeamMember['status'];

export const roleColors: Record<MemberRole, string> = {
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  member: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

export const statusColors: Record<MemberStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-slate-400',
};
