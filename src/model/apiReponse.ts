export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
}

export interface PageData<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
