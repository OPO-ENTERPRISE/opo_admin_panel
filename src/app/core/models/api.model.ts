export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    requestId: string;
    ts: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: PaginationInfo;
}

export interface TopicFilters extends PaginationParams {
  area?: string;
  enabled?: boolean;
  premium?: boolean;
  search?: string;
  type?: 'topic' | 'exam' | 'misc';
}

export interface HistoryFilters extends PaginationParams {
  text?: string;
  dateFrom?: string;
  dateTo?: string;
  topicIds?: string[];
  minAccuracy?: number;
  negativeOnly?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
