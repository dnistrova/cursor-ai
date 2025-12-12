import type { ChartPlaceholderProps } from '../../types/dashboard';

export function ChartPlaceholder({ 
  type, 
  title, 
  subtitle, 
  loading = false,
  height = 300 
}: ChartPlaceholderProps) {
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <LineChartPlaceholder />;
      case 'bar':
        return <BarChartPlaceholder />;
      case 'area':
        return <AreaChartPlaceholder />;
      case 'pie':
        return <PieChartPlaceholder />;
      case 'donut':
        return <DonutChartPlaceholder />;
      default:
        return <LineChartPlaceholder />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 
                      border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          <div 
            className="bg-slate-100 dark:bg-slate-700/50 rounded-xl"
            style={{ height: height - 80 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 
                    border border-slate-200 dark:border-slate-700
                    hover:shadow-lg dark:hover:shadow-slate-900/50
                    transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
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
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Download chart">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="More options">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ height: height - 80 }}>
        {renderChart()}
      </div>
    </div>
  );
}

function LineChartPlaceholder() {
  return (
    <div className="relative w-full h-full flex items-end">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>100k</span>
        <span>75k</span>
        <span>50k</span>
        <span>25k</span>
        <span>0</span>
      </div>
      
      {/* Chart area */}
      <div className="flex-1 ml-14 h-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-dashed border-slate-200 dark:border-slate-700" />
          ))}
        </div>
        
        {/* Line chart SVG */}
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Gradient */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40 V200 H0 Z"
            fill="url(#lineGradient)"
            className="dark:opacity-50"
          />
          
          {/* Line */}
          <path
            d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-lg"
          />
          
          {/* Data points */}
          {[[0, 150], [100, 100], [200, 80], [300, 60], [400, 40]].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="6"
              fill="white"
              stroke="#6366f1"
              strokeWidth="3"
              className="drop-shadow"
            />
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
        </div>
      </div>
    </div>
  );
}

function BarChartPlaceholder() {
  const bars = [65, 85, 55, 95, 75, 90, 60, 80];
  
  return (
    <div className="relative w-full h-full flex items-end">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>
      
      {/* Chart area */}
      <div className="flex-1 ml-14 h-full relative pb-8">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-dashed border-slate-200 dark:border-slate-700" />
          ))}
        </div>
        
        {/* Bars */}
        <div className="relative z-10 h-full flex items-end justify-around gap-2 px-2">
          {bars.map((height, i) => (
            <div 
              key={i}
              className="flex-1 max-w-12 bg-gradient-to-t from-indigo-600 to-violet-500 
                        rounded-t-lg hover:from-indigo-500 hover:to-violet-400 
                        transition-all duration-300 cursor-pointer
                        shadow-lg shadow-indigo-500/20"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around text-xs text-slate-400 dark:text-slate-500 px-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((day, i) => (
            <span key={i} className="flex-1 max-w-12 text-center">{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AreaChartPlaceholder() {
  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        {/* Gradients */}
        <defs>
          <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area 1 */}
        <path
          d="M0,180 Q50,160 100,140 T200,100 T300,80 T400,60 V200 H0 Z"
          fill="url(#areaGradient1)"
        />
        <path
          d="M0,180 Q50,160 100,140 T200,100 T300,80 T400,60"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
        />
        
        {/* Area 2 */}
        <path
          d="M0,190 Q50,170 100,160 T200,130 T300,110 T400,90 V200 H0 Z"
          fill="url(#areaGradient2)"
        />
        <path
          d="M0,190 Q50,170 100,160 T200,130 T300,110 T400,90"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
      </svg>
      
      {/* Legend */}
      <div className="absolute top-2 right-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-slate-600 dark:text-slate-400">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-slate-600 dark:text-slate-400">Orders</span>
        </div>
      </div>
    </div>
  );
}

function PieChartPlaceholder() {
  const segments = [
    { percent: 35, color: '#6366f1', label: 'Electronics' },
    { percent: 25, color: '#8b5cf6', label: 'Clothing' },
    { percent: 20, color: '#a855f7', label: 'Home' },
    { percent: 12, color: '#c084fc', label: 'Sports' },
    { percent: 8, color: '#e9d5ff', label: 'Other' },
  ];

  let cumulativePercent = 0;

  return (
    <div className="w-full h-full flex items-center justify-center gap-8">
      {/* Pie Chart */}
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 100 100">
          {segments.map((segment, i) => {
            const startAngle = cumulativePercent * 3.6;
            cumulativePercent += segment.percent;
            const endAngle = cumulativePercent * 3.6;
            
            const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArc = segment.percent > 50 ? 1 : 0;
            
            return (
              <path
                key={i}
                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {segment.label}
            </span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {segment.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChartPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            className="dark:stroke-slate-700"
          />
          
          {/* Progress segments */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#6366f1"
            strokeWidth="12"
            strokeDasharray="188 63"
            strokeDashoffset="63"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="12"
            strokeDasharray="63 188"
            strokeDashoffset="-125"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">75%</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Complete</span>
        </div>
      </div>
    </div>
  );
}





