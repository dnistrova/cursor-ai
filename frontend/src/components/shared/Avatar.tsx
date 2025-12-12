import type { MemberStatus } from '../../types/team';
import { statusColors } from '../../types/team';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: MemberStatus;
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 ring-1',
  sm: 'w-2.5 h-2.5 ring-2',
  md: 'w-3 h-3 ring-2',
  lg: 'w-3.5 h-3.5 ring-2',
  xl: 'w-4 h-4 ring-2',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-purple-600',
  ];
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  status, 
  showStatus = false,
  className = '' 
}: AvatarProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover 
                     ring-2 ring-white dark:ring-slate-800`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColorFromName(name)}
                     flex items-center justify-center font-semibold text-white
                     ring-2 ring-white dark:ring-slate-800`}
        >
          {getInitials(name)}
        </div>
      )}
      
      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} 
                     ${statusColors[status]} rounded-full
                     ring-white dark:ring-slate-800`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  members: Array<{ name: string; avatar?: string; status?: MemberStatus }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function AvatarGroup({ 
  members, 
  max = 4, 
  size = 'sm',
  showStatus = false 
}: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((member, index) => (
        <Avatar
          key={index}
          src={member.avatar}
          name={member.name}
          size={size}
          status={member.status}
          showStatus={showStatus}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-slate-200 dark:bg-slate-700
                     flex items-center justify-center font-semibold 
                     text-slate-600 dark:text-slate-300
                     ring-2 ring-white dark:ring-slate-800`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}


