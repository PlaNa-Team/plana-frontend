import axios, { AxiosResponse, AxiosError } from 'axios';
import { SignUpRequest, IdCheckResponse, LoginResponseDto } from '../types';
import { MonthlyScheduleResponse, CalendarEvent } from '../types/calendar.types';

let store: any = null;

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

const getAuthActions = () => {
  try {
    return require('../store/slices/authSlice');
  } catch (error) {
    console.warn('Auth actions를 가져올 수 없습니다:', error);
    return null;
  }
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

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
    const currentStore = getStore();
    let token = null;
    
    if (currentStore) {
      const state = currentStore.getState();
      token = state.auth?.accessToken;
    }
    
    if (!token) {
      token = localStorage.getItem('accessToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/';
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (isLoginPage) {
        return Promise.reject(error);
      }
      
      const currentStore = getStore();
      const authActions = getAuthActions();
      
      if (currentStore && authActions) {
        // 향후 리프레시 토큰 로직 추가 예정
        currentStore.dispatch(authActions.logout());
        return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
      }
    }
    
    return Promise.reject(error);
  }
);

// API 응답을 FullCalendar 형식으로 변환하는 함수
export const transformSchedulesToEvents = (schedules: MonthlyScheduleResponse['data']['schedules']): CalendarEvent[] => {
  return schedules.map(schedule => ({
    id: schedule.virtualId || schedule.id.toString(),
    title: schedule.title,
    start: schedule.startAt,
    end: schedule.endAt,
    allDay: schedule.isAllDay,
    backgroundColor: schedule.color,
    borderColor: schedule.color,
    extendedProps: {
      categoryName: schedule.categoryName,
      isRecurring: schedule.isRecurring,
      originalId: schedule.id
    }
  }));
};

export const authAPI = {
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
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '아이디 중복 확인에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
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
  
  verifyEmailCode: async (email: string, code: string) => {
    try {
      const response = await apiClient.post('/auth/email/verify', { email, code });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          return error.response.data; 
        }
        const errorMessage = error.response?.data?.message || '이메일 인증에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  
  // 백엔드 LoginResponseDto 구조에 맞춤
  login: async (loginData: { email: string; password: string }): Promise<LoginResponseDto> => {
    try {
      const response = await apiClient.post<LoginResponseDto>('/auth/login', loginData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }
}


// API 객체에 추가할 함수
export const calendarAPI = {
  // 월간 일정 조회
  getMonthlySchedules: async (year: number, month: number): Promise<MonthlyScheduleResponse> => {
    try {
      const response = await apiClient.get<MonthlyScheduleResponse>(
        `/calendars?year=${year}&month=${month}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '일정 조회에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }
};


export default apiClient;