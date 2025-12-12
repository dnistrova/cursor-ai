import { Card, CardHeader } from '../shared/Card';

interface ProgressChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  type?: 'donut' | 'bar' | 'horizontal';
}

export function ProgressChart({ 
  data, 
  title = 'Progress Overview',
  subtitle,
  showLegend = true,
  type = 'donut'
}: ProgressChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Chart */}
        {type === 'donut' && <DonutChart data={data} total={total} />}
        {type === 'bar' && <BarChart data={data} />}
        {type === 'horizontal' && <HorizontalBarChart data={data} />}

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 w-full space-y-3">
            {data.map((item, index) => {
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({percent}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function DonutChart({ data, total }: { data: ProgressChartProps['data']; total: number }) {
  // Pre-compute segment offsets to avoid mutation during render
  const segments = data.reduce<{ percent: number; dashArray: number; dashOffset: number; color: string }[]>(
    (acc, item) => {
      const prevCumulative = acc.length > 0 
        ? acc.reduce((sum, seg) => sum + seg.percent, 0) 
        : 0;
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const dashArray = percent * 2.51327; // 2 * PI * 40 / 100
      const dashOffset = -prevCumulative * 2.51327;
      acc.push({ percent, dashArray, dashOffset, color: item.color });
      return acc;
    },
    []
  );

  return (
    <div className="relative shrink-0">
      <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-100 dark:text-slate-700"
        />
        
        {/* Data segments */}
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={segment.color}
            strokeWidth="12"
            strokeDasharray={`${segment.dashArray} 251.327`}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {total}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: ProgressChartProps['data'] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((item, index) => {
        const heightPercent = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-slate-900 dark:text-white">
              {item.value}
            </span>
            <div 
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{ 
                height: `${heightPercent}%`, 
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarChart({ data }: { data: ProgressChartProps['data'] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full space-y-4">
      {data.map((item, index) => {
        const widthPercent = (item.value / maxValue) * 100;
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface WeeklyProgressProps {
  data: {
    day: string;
    completed: number;
    added: number;
  }[];
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.completed, d.added]), 1);

  return (
    <Card>
      <CardHeader
        title="Weekly Progress"
        subtitle="Tasks completed vs added"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />

      <div className="flex items-end gap-2 h-32 mt-4">
        {data.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1" style={{ height: '100px' }}>
              <div 
                className="w-3 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-300"
                style={{ height: `${(day.completed / maxValue) * 100}%`, minHeight: '4px' }}
                title={`Completed: ${day.completed}`}
              />
              <div 
                className="w-3 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t transition-all duration-300"
                style={{ height: `${(day.added / maxValue) * 100}%`, minHeight: '4px' }}
                title={`Added: ${day.added}`}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{day.day}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-violet-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Added</span>
        </div>
      </div>
    </Card>
  );
}

