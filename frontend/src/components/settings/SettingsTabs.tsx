import type { SettingsTab } from '../../types/settings';

interface SettingsTabsProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <>
      {/* Desktop Tabs - Vertical Sidebar */}
      <nav 
        className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0"
        aria-label="Settings navigation"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-left rounded-xl
                         transition-all duration-200 group
                         ${isActive 
                           ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`transition-colors duration-200
                              ${isActive 
                                ? 'text-indigo-600 dark:text-indigo-400' 
                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Tabs - Horizontal Scrollable */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <nav 
          className="flex gap-1 min-w-max"
          aria-label="Settings navigation"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap
                           transition-all duration-200
                           ${isActive 
                             ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/25' 
                             : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}





