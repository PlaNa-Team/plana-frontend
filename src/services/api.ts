// API 호출 함수들 - 전역 토큰 관리 추가

// 현재 파일의 목적 :
// 기본 구조 제공 / 타입 안정성 확보 / 개발 시작점 제공
// ✅ 전역 토큰 관리 및 자동 헤더 추가

// 백엔드 연동 시 수정 필요한 부분 : 
// API 엔드포인트 URL / 요청,응답 구조 / 인증 방식 / 에러 처리 방식

import axios, { AxiosResponse, AxiosError } from 'axios';
import { SignUpRequest, IdCheckResponse } from '../types';

// ✅ Redux store import (순환 참조 방지를 위해 동적 import 사용)
let store: any = null;

// store를 동적으로 가져오는 함수
const getStore = () => {
  if (!store) {
    try {
      store = require('../store').store;
    } catch (error) {
      console.warn('Redux store를 가져올 수 없습니다:', error);
    }
  }
  return store;
};

// Redux 액션을 동적으로 가져오는 함수
const getAuthActions = () => {
  try {
    return require('../store/slices/authSlice');
  } catch (error) {
    console.warn('Auth actions를 가져올 수 없습니다:', error);
    return null;
  }
};

// 환경변수에서 API URL 가져오기
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

// ✅ 요청 인터셉터 - 모든 요청에 자동으로 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    // 1순위: Redux store에서 토큰 가져오기 (실시간 상태)
    const currentStore = getStore();
    let token = null;
    
    if (currentStore) {
      const state = currentStore.getState();
      token = state.auth?.accessToken;
    }
    
    // 2순위: localStorage에서 토큰 가져오기 (fallback)
    if (!token) {
      token = localStorage.getItem('accessToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API 요청에 토큰 자동 추가');
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ 응답 인터셉터 - 토큰 만료시 자동 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const currentStore = getStore();
      const authActions = getAuthActions();
      
      if (currentStore && authActions) {
        const state = currentStore.getState();
        const refreshToken = state.auth?.refreshToken;
        
        if (refreshToken) {
          try {
            console.log('🔄 토큰 갱신 시도...');
            
            // ✅ 리프레시 토큰으로 새 토큰 발급
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken
            });
            
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            
            // ✅ Redux store 업데이트
            currentStore.dispatch(authActions.updateTokens({
              accessToken,
              refreshToken: newRefreshToken
            }));
            
            // ✅ 원래 요청에 새 토큰 적용 후 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            console.log('✅ 토큰 갱신 성공, 요청 재시도');
            return apiClient(originalRequest);
            
          } catch (refreshError) {
            console.error('❌ 토큰 갱신 실패, 로그아웃 처리');
            
            // ✅ 리프레시도 실패하면 로그아웃
            currentStore.dispatch(authActions.logout());
            window.location.href = '/login';
          }
        } else {
          // 리프레시 토큰이 없으면 로그아웃
          console.log('🚪 리프레시 토큰 없음, 로그아웃 처리');
          currentStore.dispatch(authActions.logout());
          window.location.href = '/login';
        }
      } else {
        // Redux store를 사용할 수 없는 경우 기존 방식 사용
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  
  //아이디 중복체크
  checkedId: async (loginId: string): Promise<IdCheckResponse> => {
    try {
      const response = await apiClient.get<IdCheckResponse>(`/members/check-id?loginId=${loginId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '아이디 중복 확인에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
  // 이메일 인증 코드 발송
  sendEmailVerification: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/email/verification-code', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '이메일 인증 코드 발송에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
  // 이메일 인증 코드 확인
  verifyEmailCode: async (email: string, code: string) => {
    try {
      const response = await apiClient.post('/auth/email/verify', { email, code });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          console.log('백엔드 응답 (400/410):', error.response.data);
          return error.response.data; 
        }
        const errorMessage = error.response?.data?.message || '이메일 인증에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
  // ✅ 로그인 (응답 타입 확장)
  login: async (loginData: { email: string; password: string }) => {
    try {
      const response = await apiClient.post<ApiResponse<{ 
        accessToken: string; 
        refreshToken?: string;
        user?: {
          id: string;
          name: string;
          email: string;
          nickname?: string;
        }
      }>>('/auth/login', loginData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
  // ✅ 토큰 갱신 API 추가
  refreshToken: async () => {
    try {
      const currentStore = getStore();
      let refreshToken = null;
      
      if (currentStore) {
        const state = currentStore.getState();
        refreshToken = state.auth?.refreshToken;
      } else {
        refreshToken = localStorage.getItem('refreshToken');
      }
      
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '토큰 갱신에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }
}

export default apiClient;