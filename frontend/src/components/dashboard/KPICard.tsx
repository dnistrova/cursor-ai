import type { KPICard as KPICardType } from '../../types/dashboard';

interface KPICardProps {
  card: KPICardType;
  loading?: boolean;
}

export function KPICard({ card, loading = false }: KPICardProps) {
  const changeColor = {
    increase: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    decrease: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50',
  };

  const changeIcon = {
    increase: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    decrease: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
      </svg>
    ),
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 
                    border border-slate-200 dark:border-slate-700
                    hover:shadow-lg dark:hover:shadow-slate-900/50
                    transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 
                       text-white shadow-lg shadow-indigo-500/30
                       group-hover:scale-110 transition-transform duration-300">
          {card.icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${changeColor[card.changeType]}`}>
          {changeIcon[card.changeType]}
          <span>{Math.abs(card.change)}%</span>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {card.title}
        </p>
        <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {card.prefix}
          {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
          {card.suffix}
        </p>
      </div>

      {/* Mini sparkline placeholder */}
      <div className="mt-4 flex items-end gap-1 h-8">
        {[40, 65, 45, 75, 55, 80, 60, 90, 70, 85, 75, 95].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500/60 
                       dark:from-indigo-400/20 dark:to-indigo-400/60 rounded-sm
                       transition-all duration-300 group-hover:from-indigo-500/30 group-hover:to-indigo-500/80"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function KPICardGrid({ cards, loading = false }: { cards: KPICardType[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {loading
        ? Array(4).fill(null).map((_, i) => (
            <KPICard key={i} card={{} as KPICardType} loading />
          ))
        : cards.map((card) => (
            <KPICard key={card.id} card={card} />
          ))}
    </div>
  );
}





