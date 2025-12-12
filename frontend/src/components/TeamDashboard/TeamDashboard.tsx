import { useState, useMemo } from 'react';
import type { TeamMember } from '../../types/team';
import type { Project, ProjectStats } from '../../types/project';
import type { Activity } from '../../types/activity';

import { ProjectOverview } from './ProjectOverview';
import { TeamMembers } from './TeamMembers';
import { ProgressChart, WeeklyProgress } from './ProgressChart';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions, FloatingActionButton } from './QuickActions';

// Sample Data
const sampleMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    role: 'owner',
    status: 'online',
    title: 'Product Manager',
    department: 'Product',
    tasksCompleted: 24,
    tasksAssigned: 28,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'admin',
    status: 'online',
    title: 'Lead Developer',
    department: 'Engineering',
    tasksCompleted: 42,
    tasksAssigned: 45,
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    role: 'member',
    status: 'away',
    title: 'UI/UX Designer',
    department: 'Design',
    tasksCompleted: 18,
    tasksAssigned: 22,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    role: 'member',
    status: 'busy',
    title: 'Backend Developer',
    department: 'Engineering',
    tasksCompleted: 31,
    tasksAssigned: 35,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    role: 'member',
    status: 'offline',
    title: 'QA Engineer',
    department: 'Quality',
    tasksCompleted: 15,
    tasksAssigned: 20,
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'viewer',
    status: 'online',
    title: 'Data Analyst',
    department: 'Analytics',
    tasksCompleted: 12,
    tasksAssigned: 15,
  },
];

const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of the mobile application with new UI/UX improvements and performance optimizations.',
    color: '#6366f1',
    status: 'active',
    priority: 'high',
    progress: 68,
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2025-12-30'),
    teamMembers: ['1', '2', '3'],
    totalTasks: 48,
    completedTasks: 32,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-12-10'),
  },
  {
    id: '2',
    name: 'API Integration',
    description: 'Integrate third-party APIs for payment processing, analytics, and social media authentication.',
    color: '#10b981',
    status: 'active',
    priority: 'urgent',
    progress: 45,
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2025-12-15'),
    teamMembers: ['2', '4'],
    totalTasks: 24,
    completedTasks: 11,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-12-08'),
  },
  {
    id: '3',
    name: 'Dashboard Analytics',
    description: 'Build comprehensive analytics dashboard with real-time data visualization and reporting.',
    color: '#f59e0b',
    status: 'active',
    priority: 'medium',
    progress: 82,
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2025-12-20'),
    teamMembers: ['1', '3', '6'],
    totalTasks: 36,
    completedTasks: 30,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-12-11'),
  },
  {
    id: '4',
    name: 'User Onboarding Flow',
    description: 'Design and implement new user onboarding experience with guided tours and tooltips.',
    color: '#ec4899',
    status: 'on-hold',
    priority: 'low',
    progress: 25,
    startDate: new Date('2024-04-01'),
    teamMembers: ['3', '5'],
    totalTasks: 18,
    completedTasks: 5,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2025-11-20'),
  },
];

const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    userId: '2',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    projectId: '1',
    projectName: 'Mobile App Redesign',
    taskId: 't1',
    taskName: 'Implement dark mode toggle',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '2',
    type: 'task_assigned',
    userId: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    projectId: '2',
    projectName: 'API Integration',
    taskId: 't2',
    taskName: 'Setup payment gateway',
    targetUserId: '4',
    targetUserName: 'James Wilson',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '3',
    type: 'task_commented',
    userId: '3',
    userName: 'Emily Davis',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    projectId: '3',
    projectName: 'Dashboard Analytics',
    taskId: 't3',
    taskName: 'Design chart components',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'file_uploaded',
    userId: '3',
    userName: 'Emily Davis',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    projectId: '1',
    projectName: 'Mobile App Redesign',
    taskName: 'UI mockups',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'task_created',
    userId: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    projectId: '2',
    projectName: 'API Integration',
    taskId: 't4',
    taskName: 'Implement OAuth2 flow',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '6',
    type: 'project_updated',
    userId: '2',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    projectId: '1',
    projectName: 'Mobile App Redesign',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    type: 'member_joined',
    userId: '6',
    userName: 'David Kim',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '8',
    type: 'deadline_updated',
    userId: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    projectId: '3',
    projectName: 'Dashboard Analytics',
    taskId: 't5',
    taskName: 'Complete data integration',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

const weeklyData = [
  { day: 'Mon', completed: 8, added: 5 },
  { day: 'Tue', completed: 12, added: 7 },
  { day: 'Wed', completed: 6, added: 10 },
  { day: 'Thu', completed: 15, added: 8 },
  { day: 'Fri', completed: 10, added: 6 },
  { day: 'Sat', completed: 4, added: 2 },
  { day: 'Sun', completed: 2, added: 1 },
];

interface TeamDashboardProps {
  teamName?: string;
}

export function TeamDashboard({ teamName = 'Acme Team' }: TeamDashboardProps) {
  const [isLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Computed stats
  const stats: ProjectStats = useMemo(() => ({
    totalProjects: sampleProjects.length,
    activeProjects: sampleProjects.filter(p => p.status === 'active').length,
    completedProjects: sampleProjects.filter(p => p.status === 'completed').length,
    overdueTasks: 3,
    tasksCompletedThisWeek: weeklyData.reduce((sum, d) => sum + d.completed, 0),
    averageProgress: Math.round(
      sampleProjects.reduce((sum, p) => sum + p.progress, 0) / sampleProjects.length
    ),
  }), []);

  // Project members mapping
  const projectMembers = useMemo(() => {
    const mapping: Record<string, Array<{ name: string; avatar?: string }>> = {};
    sampleProjects.forEach(project => {
      mapping[project.id] = project.teamMembers
        .map(id => sampleMembers.find(m => m.id === id))
        .filter(Boolean)
        .map(m => ({ name: m!.name, avatar: m!.avatar }));
    });
    return mapping;
  }, []);

  // Task distribution for chart
  const taskDistribution = useMemo(() => [
    { label: 'Completed', value: 142, color: '#10b981' },
    { label: 'In Progress', value: 38, color: '#6366f1' },
    { label: 'To Do', value: 24, color: '#f59e0b' },
    { label: 'Blocked', value: 5, color: '#ef4444' },
  ], []);

  const handleAddTask = () => {
    setShowAddTask(true);
    // Would open modal in real implementation
    console.log('Add task clicked');
  };

  const handleAddProject = () => {
    console.log('Add project clicked');
  };

  const handleInviteMember = () => {
    console.log('Invite member clicked');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {teamName}
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Welcome back! Here's what's happening with your team.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleInviteMember}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300
                         bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600
                         rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <span className="hidden sm:inline">Invite</span>
                <span className="sm:hidden">+</span>
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2.5 text-sm font-semibold text-white
                         bg-gradient-to-r from-indigo-600 to-violet-600
                         hover:from-indigo-500 hover:to-violet-500
                         rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview with Stats */}
            <ProjectOverview
              projects={sampleProjects}
              stats={stats}
              members={projectMembers}
              loading={isLoading}
              onViewAll={() => console.log('View all projects')}
              onProjectClick={(project) => console.log('Project clicked:', project.name)}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressChart
                data={taskDistribution}
                title="Task Distribution"
                subtitle="Current sprint overview"
                type="donut"
              />
              <WeeklyProgress data={weeklyData} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions
              onAddTask={handleAddTask}
              onAddProject={handleAddProject}
              onInviteMember={handleInviteMember}
              onScheduleMeeting={() => console.log('Schedule meeting')}
              onUploadFile={() => console.log('Upload file')}
              onGenerateReport={() => console.log('Generate report')}
            />

            {/* Team Members */}
            <TeamMembers
              members={sampleMembers}
              maxDisplay={5}
              onViewAll={() => console.log('View all members')}
              onMemberClick={(member) => console.log('Member clicked:', member.name)}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={sampleActivities}
              maxDisplay={6}
              loading={isLoading}
              onViewAll={() => console.log('View all activities')}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={handleAddTask}
        label="New Task"
      />

      {/* Modal would go here */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Add New Task
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Task creation modal would go here...
            </p>
            <button
              onClick={() => setShowAddTask(false)}
              className="w-full py-2.5 text-sm font-medium text-white
                       bg-indigo-600 hover:bg-indigo-500 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamDashboard;


