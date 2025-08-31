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

// 백엔드 LoginResponseDto에 맞는 타입
export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  member: {
    id: number;
    name: string;
    email: string;
    nickname?: string;
  };
  timestamp: number;
  refreshToken: string;
}