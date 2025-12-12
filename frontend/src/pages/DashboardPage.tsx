import { useState } from 'react';
import { KPICard } from '../components/dashboard/KPICard';
import { ChartPlaceholder } from '../components/dashboard/ChartPlaceholder';
import { DataTable } from '../components/dashboard/DataTable';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import type { KPICard as KPICardType, DashboardFilters as FiltersType, TableColumn, TableRow, ChartData } from '../types/dashboard';

// Sample KPI data
const kpiData: KPICardType[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: 124563,
    change: 12.5,
    changeType: 'increase',
    prefix: '$',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: '2',
    title: 'Total Orders',
    value: 1847,
    change: 8.2,
    changeType: 'increase',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: '3',
    title: 'Active Users',
    value: 3254,
    change: -2.4,
    changeType: 'decrease',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: 3.24,
    change: 0.8,
    changeType: 'increase',
    suffix: '%',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// Sample chart data
const revenueChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    { label: 'Revenue', data: [12000, 19000, 15000, 25000, 22000, 30000, 28000], color: '#6366f1' },
    { label: 'Expenses', data: [8000, 12000, 10000, 15000, 14000, 18000, 16000], color: '#ec4899' },
  ],
};

const ordersChartData: ChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { label: 'Orders', data: [45, 52, 38, 65, 48, 72, 58], color: '#10b981' },
  ],
};

const categoryChartData: ChartData = {
  labels: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
  datasets: [
    { label: 'Sales', data: [35, 25, 20, 12, 8] },
  ],
};

// Sample table data
const tableColumns: TableColumn[] = [
  { key: 'id', header: 'Order ID', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'product', header: 'Product', sortable: true },
  { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
  { 
    key: 'status', 
    header: 'Status', 
    sortable: true,
    render: (value) => {
      const status = value as string;
      const colors: Record<string, string> = {
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
        processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || ''}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
  },
  { key: 'date', header: 'Date', sortable: true },
];

const tableData: TableRow[] = [
  { id: 'ORD-001', customer: 'John Smith', product: 'Wireless Headphones', amount: '$129.99', status: 'completed', date: '2025-12-10' },
  { id: 'ORD-002', customer: 'Emily Davis', product: 'Smart Watch', amount: '$299.99', status: 'processing', date: '2025-12-10' },
  { id: 'ORD-003', customer: 'Michael Brown', product: 'Laptop Stand', amount: '$79.99', status: 'pending', date: '2025-12-09' },
  { id: 'ORD-004', customer: 'Sarah Wilson', product: 'Mechanical Keyboard', amount: '$159.99', status: 'completed', date: '2025-12-09' },
  { id: 'ORD-005', customer: 'David Lee', product: 'USB-C Hub', amount: '$49.99', status: 'cancelled', date: '2025-12-08' },
  { id: 'ORD-006', customer: 'Lisa Anderson', product: 'Monitor Arm', amount: '$89.99', status: 'completed', date: '2025-12-08' },
  { id: 'ORD-007', customer: 'James Taylor', product: 'Webcam HD', amount: '$119.99', status: 'processing', date: '2025-12-07' },
  { id: 'ORD-008', customer: 'Emma Martinez', product: 'Desk Mat', amount: '$34.99', status: 'completed', date: '2025-12-07' },
];

// Filter options
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function DashboardPage() {
  const [filters, setFilters] = useState<FiltersType>({
    dateRange: { start: null, end: null },
    category: 'all',
    status: 'all',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your store performance and analytics
        </p>
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categoryOptions}
        statuses={statusOptions}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.id} card={kpi} loading={isLoading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPlaceholder
          type="area"
          title="Revenue Overview"
          subtitle="Monthly revenue and expenses"
          data={revenueChartData}
          loading={isLoading}
          height={300}
        />
        <ChartPlaceholder
          type="bar"
          title="Daily Orders"
          subtitle="Orders this week"
          data={ordersChartData}
          loading={isLoading}
          height={300}
        />
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartPlaceholder
          type="donut"
          title="Sales by Category"
          subtitle="Distribution of sales"
          data={categoryChartData}
          loading={isLoading}
          height={250}
        />
        <div className="lg:col-span-2">
          <ChartPlaceholder
            type="line"
            title="Traffic Analytics"
            subtitle="Website visitors over time"
            data={revenueChartData}
            loading={isLoading}
            height={250}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Recent Orders
        </h2>
        <DataTable
          columns={tableColumns}
          data={tableData}
          loading={isLoading}
          pageSize={5}
        />
      </div>
    </div>
  );
}

