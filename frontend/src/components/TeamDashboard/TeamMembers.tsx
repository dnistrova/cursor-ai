import type { TeamMember } from '../../types/team';
import { roleColors } from '../../types/team';
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge';
import { Card, CardHeader } from '../shared/Card';

interface TeamMembersProps {
  members: TeamMember[];
  maxDisplay?: number;
  onViewAll?: () => void;
  onMemberClick?: (member: TeamMember) => void;
}

export function TeamMembers({ 
  members, 
  maxDisplay = 5,
  onViewAll,
  onMemberClick 
}: TeamMembersProps) {
  const displayMembers = members.slice(0, maxDisplay);
  const remaining = members.length - maxDisplay;
  
  const onlineCount = members.filter(m => m.status === 'online').length;

  return (
    <Card>
      <CardHeader
        title="Team Members"
        subtitle={`${onlineCount} online · ${members.length} total`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        action={
          onViewAll && remaining > 0 && (
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

      <div className="space-y-3">
        {displayMembers.map((member) => (
          <MemberRow 
            key={member.id} 
            member={member} 
            onClick={() => onMemberClick?.(member)}
          />
        ))}
        
        {remaining > 0 && (
          <button
            onClick={onViewAll}
            className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400
                     hover:text-indigo-600 dark:hover:text-indigo-400
                     hover:bg-slate-50 dark:hover:bg-slate-700/50
                     rounded-xl transition-colors"
          >
            +{remaining} more members
          </button>
        )}
      </div>
    </Card>
  );
}

interface MemberRowProps {
  member: TeamMember;
  onClick?: () => void;
}

function MemberRow({ member, onClick }: MemberRowProps) {
  const progressPercent = member.tasksAssigned > 0 
    ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100) 
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl
               hover:bg-slate-50 dark:hover:bg-slate-700/50
               transition-colors group text-left"
    >
      <Avatar 
        src={member.avatar}
        name={member.name}
        size="md"
        status={member.status}
        showStatus
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white truncate">
            {member.name}
          </span>
          <Badge variant="default" size="sm" className={roleColors[member.role]}>
            {member.role}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {member.title || member.department || member.email}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {member.tasksCompleted}/{member.tasksAssigned}
        </div>
        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
}

interface MemberGridProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
}

export function MemberGrid({ members, onMemberClick }: MemberGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {members.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => onMemberClick?.(member)}
          className="flex flex-col items-center p-4 rounded-2xl
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700
                   hover:shadow-lg dark:hover:shadow-slate-900/50
                   hover:border-indigo-300 dark:hover:border-indigo-700
                   transition-all duration-300"
        >
          <Avatar 
            src={member.avatar}
            name={member.name}
            size="lg"
            status={member.status}
            showStatus
          />
          <span className="mt-3 font-medium text-slate-900 dark:text-white text-center truncate w-full">
            {member.name}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 truncate w-full text-center">
            {member.title || member.role}
          </span>
        </button>
      ))}
    </div>
  );
}


