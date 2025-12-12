import type { User } from '../../types/social';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  online?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizeClasses = {
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

export function UserAvatar({ 
  user, 
  size = 'md', 
  showStatus = false, 
  online = false,
  className = '' 
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const gradients = [
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
  ];

  // Deterministic gradient based on user id
  const gradientIndex = user.id.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div className={`relative inline-block ${className}`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient}
                      flex items-center justify-center text-white font-semibold
                      ring-2 ring-white dark:ring-slate-800`}
        >
          {getInitials(user.name)}
        </div>
      )}
      
      {/* Verified badge */}
      {user.verified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Online status */}
      {showStatus && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} 
                      rounded-full border-white dark:border-slate-800
                      ${online ? 'bg-emerald-500' : 'bg-slate-400'}`}
        />
      )}
    </div>
  );
}

