import { useState } from 'react';
import type { DataTableProps, TableColumn } from '../../types/dashboard';

export function DataTable({ 
  columns, 
  data, 
  loading = false,
  pageSize = 10 
}: DataTableProps) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (column: TableColumn) => {
    if (!column.sortable) return;
    
    if (sortBy === column.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column.key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return sortOrder === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          
          {/* Table skeleton */}
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
            {[...Array(5)].map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-5 gap-4 py-3 border-t border-slate-100 dark:border-slate-700">
                {[...Array(5)].map((_, colIdx) => (
                  <div key={colIdx} className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Orders
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data.length} total orders
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
                          hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider
                            text-slate-500 dark:text-slate-400
                            ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                            ${column.sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none' : ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className={`flex items-center gap-1.5 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    {column.header}
                    {column.sortable && (
                      <span className={`transition-colors ${sortBy === column.key ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}>
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedData.map((row) => (
              <tr 
                key={row.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm
                              ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : <span className="text-slate-900 dark:text-white">{String(row[column.key] ?? '')}</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, data.length)} of {data.length} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                        hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors
                          ${currentPage === i + 1
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                        hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge component for table cells
export function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    shipped: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${statusStyles[status.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
      {status}
    </span>
  );
}




