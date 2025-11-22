import { PaginationParams } from '@aiaca/domain';

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type PageParams = Partial<PaginationParams> & Record<string, unknown>;

export interface ApiError {
  code?: string;
  message: string;
  errors?: unknown;
  status?: number;
}

export interface MutationOptions {
  params?: Record<string, string | number | boolean | null | undefined>;
  idempotencyKey?: string;
  headers?: Record<string, string>;
}
