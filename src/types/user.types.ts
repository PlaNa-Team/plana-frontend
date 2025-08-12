// TypeScript 타입 정의 - 사용자 관련 타입
export type Provider = 'GOOGLE' | 'LOCAL';

export interface User {
  id: number;
  name: string;
  loginId: string;
  email: string;
  password: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  provider: Provider;
  refreshToken: string;
}

export interface SignUpRequest {
  name: string;
  loginId: string;    
  email: string;
  password: string;
  nickname: string;
  provider: string;
}

export interface IdCheckResponse {
  status: number;
  available: boolean;
  message: string;
}