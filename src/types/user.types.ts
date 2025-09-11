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
  // refreshToken: string;
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
  // refreshToken: string; // 쿠키에 저장 한다고 함. 다시 주석
}

export interface MemberInfo {
  id: number;
  login_id: string;
  name: string;
  email: string;
  nickname: string;
  provider: string;
  created_at: string;
}

export interface MemberApiResponse {
  status: number;
  message: string;
  data: MemberInfo;
}


// 비밀번호 확인 요청 타입
export interface PasswordConfirmRequest {
  currentPassword: string;
}

// 비밀번호 확인 응답 타입
export interface PasswordConfirmResponse {
  timestamp: number;
  message: string;
  status: number;
}

// 비밀번호 변경 요청 타입
export interface PasswordUpdateRequest {
  newPassword: string;
  confirmPassword: string;
}

// 비밀번호 변경 응답 타입 (API 문서에 맞게 조정)
export interface PasswordUpdateResponse {
  timestamp: number;
  message: string;
  status: number;
}

export interface deleteIdResponse {
  timestamp: number;
  message: string;
  status: number;
}


export interface ResetPasswordPayload {
  email: string; 
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  status: number;
  message: string;
  timestamp: number;
  error: string;
}