import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const baseClasses = `bg-white dark:bg-slate-800 rounded-2xl
                       border border-slate-200 dark:border-slate-700
                       ${paddingClasses[padding]}
                       ${hover ? 'hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow duration-300 cursor-pointer' : ''}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${className} text-left w-full`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 
                         text-white shadow-lg shadow-indigo-500/25">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon,
  trend = 'neutral' 
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    down: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 
                         text-white shadow-lg shadow-indigo-500/25">
            {icon}
          </div>
        )}
        {change !== undefined && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full 
                          text-xs font-semibold ${trendColors[trend]}`}>
            {trendIcons[trend]} {Math.abs(change)}%
          </span>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        {changeLabel && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {changeLabel}
          </p>
        )}
      </div>
    </Card>
  );
}
