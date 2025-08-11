// API 호출 함수들

// 현재 파일의 목적 :
// 기본 구조 제공 / 타입 안정성 확보 / 개발 시작점 제공

// 백엔드 연동 시 수정 필요한 부분 : 
// API 엔드포인트 URL / 요청,응답 구조 / 인증 방식 / 에러 처리 방식

// 나중에 API 호출할 때 파일 수정해서 사용하기

import axios, { AxiosResponse, AxiosError } from 'axios';
import { SignUpRequest , IdCheckResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 에러 응답 타입
export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
  details?: any;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

//인증 관련 API 
export const authAPI = {
  // 회원가입
  signUp: async (userData: SignUpRequest): Promise<SignUpRequest> => {
    try {
      const response = await apiClient.post<ApiResponse<SignUpRequest>>('/auth/signup', userData);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
    checkedId: async (loginId: string): Promise<IdCheckResponse> => {
    try {
      const response = await apiClient.get<IdCheckResponse>(`/members/check-id?loginId=${loginId}`);
      
      // 백엔드에서 200으로 성공/실패 모두 보내므로 응답 데이터를 그대로 반환
      return response.data;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '아이디 중복 확인에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
}
export default apiClient;