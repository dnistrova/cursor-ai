export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ColumnId = 'todo' | 'in-progress' | 'done';

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  assignees: Assignee[];
  tags?: string[];
  createdAt: string;
  columnId: ColumnId;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: Column[];
}

export interface DragItem {
  taskId: string;
  sourceColumnId: ColumnId;
}

// Priority configuration
export const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: 'Low',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  high: {
    label: 'High',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
};

// Column configuration
export const columnConfig: Record<ColumnId, { title: string; color: string; icon: string }> = {
  'todo': {
    title: 'To Do',
    color: 'border-slate-300 dark:border-slate-600',
    icon: '📋',
  },
  'in-progress': {
    title: 'In Progress',
    color: 'border-blue-400 dark:border-blue-500',
    icon: '🔄',
  },
  'done': {
    title: 'Done',
    color: 'border-emerald-400 dark:border-emerald-500',
    icon: '✅',
  },
};

// Sample data
export const sampleAssignees: Assignee[] = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: '2', name: 'Alex Morgan', initials: 'AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: '3', name: 'Jordan Lee', initials: 'JL', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: '4', name: 'Taylor Kim', initials: 'TK' },
  { id: '5', name: 'Casey Rivera', initials: 'CR' },
];

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new marketing landing page',
    priority: 'high',
    dueDate: '2025-12-15',
    assignees: [sampleAssignees[0], sampleAssignees[1]],
    tags: ['design', 'marketing'],
    createdAt: '2025-12-01',
    columnId: 'todo',
  },
  {
    id: '2',
    title: 'Fix authentication bug',
    description: 'Users are being logged out unexpectedly after 5 minutes',
    priority: 'urgent',
    dueDate: '2025-12-11',
    assignees: [sampleAssignees[2]],
    tags: ['bug', 'backend'],
    createdAt: '2025-12-05',
    columnId: 'todo',
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Add API documentation for the new endpoints',
    priority: 'low',
    dueDate: '2025-12-20',
    assignees: [sampleAssignees[3]],
    tags: ['docs'],
    createdAt: '2025-12-02',
    columnId: 'todo',
  },
  {
    id: '4',
    title: 'Implement dark mode',
    description: 'Add dark mode support to all components',
    priority: 'medium',
    dueDate: '2025-12-18',
    assignees: [sampleAssignees[0], sampleAssignees[4]],
    tags: ['feature', 'ui'],
    createdAt: '2025-12-03',
    columnId: 'in-progress',
  },
  {
    id: '5',
    title: 'Performance optimization',
    description: 'Optimize bundle size and reduce initial load time',
    priority: 'high',
    assignees: [sampleAssignees[1]],
    tags: ['performance'],
    createdAt: '2025-12-04',
    columnId: 'in-progress',
  },
  {
    id: '6',
    title: 'User testing session',
    description: 'Conduct user testing for the new checkout flow',
    priority: 'medium',
    dueDate: '2025-12-08',
    assignees: [sampleAssignees[2], sampleAssignees[3]],
    tags: ['ux', 'testing'],
    createdAt: '2025-12-01',
    columnId: 'done',
  },
  {
    id: '7',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    priority: 'high',
    assignees: [sampleAssignees[4]],
    tags: ['devops'],
    createdAt: '2025-11-28',
    columnId: 'done',
  },
];

