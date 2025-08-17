import axios, { AxiosResponse, AxiosError } from 'axios';
import { SignUpRequest, IdCheckResponse, LoginResponseDto } from '../types';
import { MonthlyScheduleResponse, CalendarEvent,ScheduleDetailResponse, ScheduleFormData, CreateScheduleResponse, UpdateScheduleResponse } from '../types/calendar.types';

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
  return schedules.map(schedule => {
    // 💡 allDay 이벤트일 경우에만 end 날짜에 하루를 더하는 로직 추가
    let adjustedEnd = schedule.endAt;
    if (schedule.isAllDay) {
      const endDate = new Date(schedule.endAt);
      endDate.setDate(endDate.getDate() + 1);
      adjustedEnd = endDate.toISOString();
    }
    
    return {
      id: schedule.virtualId || schedule.id.toString(),
      title: schedule.title,
      start: schedule.startAt,
      end: adjustedEnd, // 🔄 수정된 adjustedEnd 사용
      allDay: schedule.isAllDay,
      backgroundColor: schedule.color,
      borderColor: schedule.color,
      extendedProps: {
        categoryName: schedule.categoryName,
        isRecurring: schedule.isRecurring,
        originalId: schedule.id
      }
    };
  });
};

//API 응답을 ScheduleFormData로 변환하는 함수 (타임존 문제 해결 버전)
export const transformDetailToFormData = (detail: ScheduleDetailResponse['data']): ScheduleFormData => {
  
  // 🔧 타임존 문제 해결: 문자열에서 직접 날짜 추출
  const startDate = detail.startAt.split('T')[0]; // '2025-08-05T00:00:00' → '2025-08-05'
  const endDate = detail.endAt.split('T')[0];     // '2025-08-06T23:59:59' → '2025-08-06'
  
  // 시간이 필요한 경우에만 Date 객체 사용 (종일 이벤트가 아닐 때)
  let startTime = '00:00';
  let endTime = '23:59';
  
  if (!detail.isAllDay) {
    const startDateTime = new Date(detail.startAt);
    const endDateTime = new Date(detail.endAt);
    startTime = startDateTime.toTimeString().slice(0, 5);
    endTime = endDateTime.toTimeString().slice(0, 5);
  }
  
  // 알림 값 변환
  const alarmTexts = (detail.alarms || []).map(alarm => {
    if (alarm.notifyBeforeVal === 0) return '시작';
    const unit = alarm.notifyUnit === 'MIN' ? '분' : 
                 alarm.notifyUnit === 'HOUR' ? '시간' : '일';
    return `${alarm.notifyBeforeVal}${unit} 전`;
  });

  // 반복 설정 변환
  const getRepeatValue = (isRecurring: boolean, rule?: string): string => {
    if (!isRecurring) return '';
    
    switch (rule) {
      case 'DAILY': return '매일';
      case 'WEEKLY': return '매주';
      case 'MONTHLY': return '매달';
      case 'YEARLY': return '매년';
      default: return rule || '매일';
    }
  };

  const result = {
    id: detail.id.toString(),
    title: detail.title,
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    isAllDay: detail.isAllDay,
    color: detail.color,
    category: detail.categoryName,
    description: detail.description || '',
    location: detail.location || '',
    memo: detail.description  || '',
    repeatValue: getRepeatValue(detail.isRecurring, detail.recurrenceRule),
    alarmValue: alarmTexts.join(', '),
    tags: (detail.tags || []).map(tag => ({
      id: tag.id ? tag.id.toString() : Math.random().toString(),
      name: tag.name || '',
      color: tag.color || 'blue'
    }))
  };
  return result;
};

export const transformFormDataToRequest = (formData: ScheduleFormData) => {
 // 1. 날짜와 시간을 ISO 형식으로 변환
 const startAt = formData.isAllDay 
   ? `${formData.startDate}T00:00:00`
   : `${formData.startDate}T${formData.startTime}:00`;
   
 const endAt = formData.isAllDay 
   ? `${formData.endDate}T23:59:59`
   : `${formData.endDate}T${formData.endTime}:00`;

 // 2. 알람 데이터 변환 ("30분 전, 10분 전" → 배열)
 const alarms: Array<{notifyBeforeVal: number; notifyUnit: 'MIN' | 'HOUR' | 'DAY'}> = [];
 if (formData.alarmValue) {
   const alarmTexts = formData.alarmValue.split(', ');
   alarmTexts.forEach(alarm => {
     if (alarm === '시작') {
       alarms.push({ notifyBeforeVal: 0, notifyUnit: 'MIN' });
     } else if (alarm.includes('분 전')) {
       const value = parseInt(alarm.replace('분 전', ''));
       alarms.push({ notifyBeforeVal: value, notifyUnit: 'MIN' });
     } else if (alarm.includes('시간 전')) {
       const value = parseInt(alarm.replace('시간 전', ''));
       alarms.push({ notifyBeforeVal: value, notifyUnit: 'HOUR' });
     } else if (alarm.includes('일 전')) {
       const value = parseInt(alarm.replace('일 전', ''));
       alarms.push({ notifyBeforeVal: value, notifyUnit: 'DAY' });
     }
   });
 }

 // 3. 반복 규칙 변환 ("매일" → "FREQ=DAILY")
 let recurrenceRule: string | undefined;
 let isRecurring = false;
 if (formData.repeatValue) {
   isRecurring = true;
   switch (formData.repeatValue) {
     case '매일':
       recurrenceRule = 'FREQ=DAILY';
       break;
     case '매주':
       recurrenceRule = 'FREQ=WEEKLY';
       break;
     case '매달':
       recurrenceRule = 'FREQ=MONTHLY';
       break;
     case '매년':
       recurrenceRule = 'FREQ=YEARLY';
       break;
     default:
       // "3일 간격으로 반복" 같은 경우 처리
       if (formData.repeatValue.includes('일 간격')) {
         const interval = parseInt(formData.repeatValue);
         recurrenceRule = `FREQ=DAILY;INTERVAL=${interval}`;
       } else if (formData.repeatValue.includes('주 간격')) {
         const interval = parseInt(formData.repeatValue);
         recurrenceRule = `FREQ=WEEKLY;INTERVAL=${interval}`;
       } else if (formData.repeatValue.includes('달 간격')) {
         const interval = parseInt(formData.repeatValue);
         recurrenceRule = `FREQ=MONTHLY;INTERVAL=${interval}`;
       }
       break;
   }
 }

 // 4. API 요청 형식으로 변환된 데이터 반환
 return {
   memberId: 1, // 임시로 1 설정 (실제로는 현재 로그인한 사용자 ID)
   categoryId: 1, // 임시로 1 설정 (실제로는 선택된 카테고리 ID)
   title: formData.title,
   color: formData.color,
   description: formData.memo || '',
   startAt,
   endAt,
   isAllDay: formData.isAllDay,
   isRecurring,
   recurrenceRule,
   recurrenceUntil: isRecurring ? '2025-12-31T23:59:59' : undefined, // 임시로 올해 말까지 설정
   alarms
 };
};

// 가상 ID에서 원본 ID 추출하는 함수
export const extractOriginalId = (eventId: string): string => {
  // "recurring-11-1755680400" → "11"
  if (eventId.startsWith('recurring-')) {
    const parts = eventId.split('-');
    return parts[1]; // 원본 ID 반환
  }
  // 일반 일정인 경우 그대로 반환
  return eventId;
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
  // 월간 일정 조회 + 날짜 클릭시 해당 날짜의 일정 필터링
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
  },
  // 일정 상세 조회
  getScheduleDetail: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    try {
      // 가상 ID인 경우 원본 ID 추출
      const originalId = extractOriginalId(scheduleId);

      const response = await apiClient.get<ScheduleDetailResponse>(
        `/calendars/${originalId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '일정 상세 조회에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
// 일정 생성
  createSchedule: async (formData: ScheduleFormData): Promise<CreateScheduleResponse> => {
    try {
      const requestData = transformFormDataToRequest(formData);
      const response = await apiClient.post<CreateScheduleResponse>(
        '/calendars', requestData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '일정 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  },
  // 일정 수정
  updateSchedule: async (scheduleId: string, formData: ScheduleFormData): Promise<UpdateScheduleResponse> => {
    try {
      // 가상 ID인 경우 원본 ID 추출
      const originalId = extractOriginalId(scheduleId);
      
      // 기존 transformFormDataToRequest 함수 사용하되 memberId만 제거
      const baseRequestData = transformFormDataToRequest(formData);
      const { memberId, ...updateRequestData } = baseRequestData; // memberId 제거
      
      const response = await apiClient.patch<UpdateScheduleResponse>(
        `/calendars/${originalId}`, updateRequestData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '일정 수정에 실패했습니다.';
        throw new Error(errorMessage);
      }
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }
}


export default apiClient;