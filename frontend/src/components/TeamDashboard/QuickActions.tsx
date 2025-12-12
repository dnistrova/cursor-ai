import { Card, CardHeader } from '../shared/Card';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: number;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onAddTask?: () => void;
  onAddProject?: () => void;
  onInviteMember?: () => void;
  onScheduleMeeting?: () => void;
  onUploadFile?: () => void;
  onGenerateReport?: () => void;
}

const defaultIcons = {
  task: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  project: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  invite: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  meeting: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  upload: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  report: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function QuickActions({ 
  actions,
  onAddTask,
  onAddProject,
  onInviteMember,
  onScheduleMeeting,
  onUploadFile,
  onGenerateReport,
}: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: 'task',
      label: 'New Task',
      icon: defaultIcons.task,
      color: 'from-indigo-500 to-violet-600',
      onClick: onAddTask || (() => {}),
    },
    {
      id: 'project',
      label: 'New Project',
      icon: defaultIcons.project,
      color: 'from-emerald-500 to-teal-600',
      onClick: onAddProject || (() => {}),
    },
    {
      id: 'invite',
      label: 'Invite Member',
      icon: defaultIcons.invite,
      color: 'from-amber-500 to-orange-600',
      onClick: onInviteMember || (() => {}),
    },
    {
      id: 'meeting',
      label: 'Schedule Meet',
      icon: defaultIcons.meeting,
      color: 'from-cyan-500 to-blue-600',
      onClick: onScheduleMeeting || (() => {}),
    },
    {
      id: 'upload',
      label: 'Upload File',
      icon: defaultIcons.upload,
      color: 'from-rose-500 to-pink-600',
      onClick: onUploadFile || (() => {}),
    },
    {
      id: 'report',
      label: 'Generate Report',
      icon: defaultIcons.report,
      color: 'from-purple-500 to-fuchsia-600',
      onClick: onGenerateReport || (() => {}),
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <Card>
      <CardHeader
        title="Quick Actions"
        subtitle="Common tasks at your fingertips"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayActions.map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
      </div>
    </Card>
  );
}

function ActionButton({ action }: { action: QuickAction }) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className="relative flex flex-col items-center gap-2 p-4 rounded-xl
               bg-slate-50 dark:bg-slate-700/50
               hover:bg-slate-100 dark:hover:bg-slate-700
               border border-transparent hover:border-slate-200 dark:hover:border-slate-600
               transition-all duration-200 group"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color}
                      text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
        {action.icon}
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
        {action.label}
      </span>
      
      {action.badge !== undefined && action.badge > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center
                        text-xs font-bold text-white bg-rose-500 rounded-full">
          {action.badge}
        </span>
      )}
    </button>
  );
}

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

export function FloatingActionButton({ onClick, icon, label = 'Add' }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 
                px-5 py-3.5 rounded-full
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                text-white font-semibold shadow-xl shadow-indigo-500/30
                hover:shadow-2xl hover:shadow-indigo-500/40
                hover:scale-105 active:scale-95
                transition-all duration-200"
      aria-label={label}
    >
      {icon || (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}


