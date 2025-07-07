// TypeScript 타입 정의 - API 관련 타입
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
}
