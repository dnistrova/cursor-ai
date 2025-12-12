import { useState } from 'react';
import type { DashboardFilters as FiltersType, FilterOption } from '../../types/dashboard';

interface DashboardFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  categories?: FilterOption[];
  statuses?: FilterOption[];
}

const defaultCategories: FilterOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Living' },
  { value: 'sports', label: 'Sports' },
];

const defaultStatuses: FilterOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'cancelled', label: 'Cancelled' },
];

const dateRangePresets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
];

export function DashboardFilters({ 
  filters, 
  onFiltersChange,
  categories = defaultCategories,
  statuses = defaultStatuses,
}: DashboardFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Last 30 days');

  const handleDatePresetClick = (preset: typeof dateRangePresets[0]) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - preset.days);
    
    setSelectedPreset(preset.label);
    onFiltersChange({
      ...filters,
      dateRange: { start, end }
    });
    setIsDatePickerOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      category: 'all',
      status: 'all',
      search: '',
    });
    setSelectedPreset('Last 30 days');
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.status !== 'all';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                        border-2 border-slate-200 dark:border-slate-600
                        bg-white dark:bg-slate-800
                        text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400
                        transition-colors"
            />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                      bg-white dark:bg-slate-800 
                      border-2 border-slate-200 dark:border-slate-600
                      rounded-xl hover:border-slate-300 dark:hover:border-slate-500
                      text-slate-700 dark:text-slate-200
                      transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{selectedPreset}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Date Picker Dropdown */}
          {isDatePickerOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDatePickerOpen(false)} 
              />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 
                            rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 
                            overflow-hidden z-20">
                <div className="p-2">
                  {dateRangePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleDatePresetClick(preset)}
                      className={`w-full px-3 py-2 text-sm text-left rounded-lg transition-colors
                                ${selectedPreset === preset.label
                                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 p-3">
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
                              hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  >
                    Custom Range...
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="appearance-none px-4 py-2.5 pr-10 text-sm font-medium
                      bg-white dark:bg-slate-800 
                      border-2 border-slate-200 dark:border-slate-600
                      rounded-xl hover:border-slate-300 dark:hover:border-slate-500
                      text-slate-700 dark:text-slate-200
                      focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400
                      cursor-pointer transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="appearance-none px-4 py-2.5 pr-10 text-sm font-medium
                      bg-white dark:bg-slate-800 
                      border-2 border-slate-200 dark:border-slate-600
                      rounded-xl hover:border-slate-300 dark:hover:border-slate-500
                      text-slate-700 dark:text-slate-200
                      focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400
                      cursor-pointer transition-colors"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                      text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
                      hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {/* Export Button */}
        <button
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    hover:from-indigo-500 hover:to-violet-500
                    text-white rounded-xl shadow-lg shadow-indigo-500/25
                    transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}





