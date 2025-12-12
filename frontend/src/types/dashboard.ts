export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DashboardFilters {
  dateRange: DateRange;
  category: string;
  status: string;
  search: string;
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

export interface ChartPlaceholderProps {
  type: ChartType;
  title: string;
  subtitle?: string;
  data?: ChartData;
  loading?: boolean;
  height?: number;
}

export interface DataTableProps {
  columns: TableColumn[];
  data: TableRow[];
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  pageSize?: number;
}





