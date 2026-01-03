import type { Activity } from '../../types/activity';
import { activityIcons, getActivityMessage, formatRelativeTime } from '../../types/activity';
import { Avatar } from '../shared/Avatar';
import { Card, CardHeader } from '../shared/Card';

interface ActivityFeedProps {
  activities: Activity[];
  maxDisplay?: number;
  onViewAll?: () => void;
  loading?: boolean;
}

export function ActivityFeed({ 
  activities, 
  maxDisplay = 8,
  onViewAll,
  loading = false 
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxDisplay);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" subtitle="Latest updates" />
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        subtitle={`${activities.length} updates`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        action={
          onViewAll && activities.length > maxDisplay && (
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

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-1">
          {displayActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity}
              isLast={index === displayActivities.length - 1}
            />
          ))}
        </div>
      </div>

      {activities.length > maxDisplay && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400
                   hover:text-indigo-600 dark:hover:text-indigo-400
                   hover:bg-slate-50 dark:hover:bg-slate-700/50
                   rounded-xl transition-colors"
        >
          View all {activities.length} activities
        </button>
      )}
    </Card>
  );
}

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

function ActivityItem({ activity, isLast = false }: ActivityItemProps) {
  const config = activityIcons[activity.type];
  const message = getActivityMessage(activity);
  const timeAgo = formatRelativeTime(activity.timestamp);

  return (
    <div className={`relative flex items-start gap-3 p-3 rounded-xl
                    hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                    ${isLast ? '' : ''}`}>
      {/* Timeline dot */}
      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                      ${config.bg} shrink-0`}>
        <span className="text-base" role="img" aria-label={activity.type}>
          {config.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar 
              src={activity.userAvatar}
              name={activity.userName}
              size="xs"
            />
            <span className="font-medium text-slate-900 dark:text-white">
              {activity.userName}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {message}
            </span>
          </div>
        </div>
        
        {activity.projectName && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>{activity.projectName}</span>
          </div>
        )}

        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
          {timeAgo}
        </span>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities: Activity[];
  groupByDate?: boolean;
}

export function ActivityTimeline({ activities, groupByDate = true }: ActivityTimelineProps) {
  if (!groupByDate) {
    return (
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity}
            isLast={index === activities.length - 1}
          />
        ))}
      </div>
    );
  }

  // Group activities by date
  const grouped = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date}>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 sticky top-0 
                        bg-white dark:bg-slate-800 py-2">
            {date}
          </h4>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-1">
              {dayActivities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity}
                  isLast={index === dayActivities.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
