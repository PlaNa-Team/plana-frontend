import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { SignUpRequest, IdCheckResponse, LoginResponseDto, MemberInfo, MemberApiResponse, PasswordConfirmRequest, PasswordConfirmResponse, PasswordUpdateRequest, PasswordUpdateResponse, PaginationResponse } from '../types';
import {
  MonthlyDiaryResponse,
  TempImageResponse,
  CreateDiaryRequest,
  DiaryCreateResponse,
  DiaryDeleteResponse,
  FriendSearchResponse,
  DiaryDetailResponse,
  UpdateDiaryRequest,
  LockAcquireResponse,
  LockRenewResponse,
  DiaryDetail,
} from '../types/diary.types';
import { 
  MonthlyScheduleResponse, 
  CalendarEvent,
  ScheduleDetailResponse, 
  ScheduleFormData, 
  CreateScheduleResponse, 
  UpdateScheduleResponse,
  // 🆕 태그 관련 타입 추가
  TagListResponse,
  CreateTagRequest,
  CreateTagResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  DeleteTagResponse,
  ServerTag,
  Tag,
  MemoItem,
  MemoPayload,
  UpdateMemoPayload,
  MemoMonthlyResponse,

} from '../types/calendar.types';
import { getHexFromColorName, getColorNameFromHex } from '../../src/utils/colors'; // 색상 변환 함수 import

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

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
  withCredentials: true, 
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


// ✅ 응답 인터셉터: 토큰 자동 갱신 로직 추가
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401 Unauthorized 에러와 토큰 재발급 시도를 한 적이 없는 요청인지 확인
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentStore = getStore();
      const refreshToken = localStorage.getItem('refreshToken');

      // 리프레시 토큰이 존재하는 경우에만 갱신 시도
      if (refreshToken) {
        try {
          const refreshResponse = await authAPI.refresh();
          const newAccessToken = refreshResponse.accessToken;

          // 새로운 액세스 토큰을 로컬 스토리지와 Redux 스토어에 저장
          currentStore.dispatch({ type: 'auth/setAccessToken', payload: newAccessToken });
          localStorage.setItem('accessToken', newAccessToken);

          // 헤더에 새로운 액세스 토큰 설정
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          // 실패했던 원래 요청을 재시도
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰 갱신 실패 시 로그아웃
          currentStore.dispatch({ type: 'auth/logout' });
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);


// 서버 태그 데이터를 프론트엔드 태그 형식으로 변환하는 함수
export const transformServerTagToFrontendTag = (serverTag: ServerTag): Tag => {
    return {
        id: serverTag.id.toString(),
        name: serverTag.name,
        color: getColorNameFromHex(serverTag.color) || serverTag.color // HEX → 색상명 변환
    };
};

// 프론트엔드 태그를 서버 요청 형식으로 변환하는 함수
export const transformFrontendTagToRequest = (tag: Tag): CreateTagRequest | UpdateTagRequest => {
    return {
        name: tag.name,
        color: getHexFromColorName(tag.color) // 색상명 → HEX 변환
    };
};

// 서버 태그 목록을 프론트엔드 태그 목록으로 변환하는 함수
export const transformServerTagsToFrontendTags = (serverTags: ServerTag[]): Tag[] => {
    return serverTags.map(transformServerTagToFrontendTag);
};

// API 응답을 FullCalendar 형식으로 변환하는 함수
export const transformSchedulesToEvents = (schedules: MonthlyScheduleResponse['data']['schedules']): CalendarEvent[] => {
  return schedules
    .filter(schedule => !schedule.isDeleted)
    .map(schedule => {
      // ✅ endAt이 존재할 때만 new Date()를 사용하도록 수정
      let adjustedEnd: string | undefined;
      if (schedule.isAllDay && schedule.endAt) {
        const endDate = new Date(schedule.endAt);
        endDate.setDate(endDate.getDate() + 1);
        adjustedEnd = endDate.toISOString();
      } else {
        adjustedEnd = schedule.endAt; // endAt이 없으면 undefined로 유지
      }
      
      return {
        id: schedule.virtualId || schedule.id.toString(),
        title: schedule.title,
        start: schedule.startAt,
        end: adjustedEnd,
        allDay: schedule.isAllDay,
        backgroundColor: schedule.color,
        borderColor: schedule.color,
        extendedProps: {
          categoryId: schedule.categoryId,
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
      // ✅ API 응답에 있는 category 객체에서 id를 가져와 categoryId에 할당합니다.
      categoryId: detail.category?.id,
      // ✅ API 응답에 있는 category 객체에서 name을 가져와 category에 할당합니다.
      category: detail.category?.name,
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
  
   const store = getStore();
   const memberId = store?.getState()?.auth?.memberId || 1;
   // 💡 categoryId를 안전하게 가져오고, Number()로 변환합니다.
      const categoryId = formData.tags && formData.tags.length > 0
          ? Number(formData.tags[0].id)
          : undefined;

    // 4. API 요청 형식으로 변환된 데이터 반환
    return {
       memberId: memberId,
       categoryId: formData.categoryId,
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
    
    sendEmailVerification: async (email: string, purpose: string) => {
        try {
          const response = await apiClient.post('/auth/email/verification-code', { email, purpose });
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
    },
     // ✅ 중복 제거 및 요청하신 로직으로 통일
    refresh: async (): Promise<LoginResponseDto> => {
        try {
            // 이 요청에 브라우저가 HttpOnly 쿠키에 담긴 리프레시 토큰을 자동으로 첨부합니다.
            const response = await apiClient.post<LoginResponseDto>('/auth/refresh');
            return response.data;
        } catch (error) {
            throw new Error('리프레시 토큰으로 갱신에 실패했습니다.');
        }
    },
    getMemberInfo: async (): Promise<MemberInfo> => {
        try {
            const response = await apiClient.get<MemberInfo>('/members/me');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || '회원 정보를 가져오는데 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

        // authAPI 객체 내의 updateNickname 함수 수정
    updateNickname: async (newNickname: string): Promise<{ success: boolean; nickname: string }> => {
        try {
            const response = await apiClient.patch('/members/nickname', { 
            nickname: newNickname 
            });
            
            // ✅ 응답 상태가 성공인 경우 간단한 성공 응답만 반환
            if (response.status === 200 || response.status === 204) {
            return { 
                success: true, 
                nickname: newNickname 
            };
            }
            
            throw new Error('닉네임 변경에 실패했습니다.');
        } catch (error) {
            if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || '닉네임 변경에 실패했습니다.';
            throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },
    // 🆕 현재 비밀번호 인증 API
    confirmPassword: async (currentPassword: string): Promise<PasswordConfirmResponse> => {
        try {
        // API 문서에 따르면 요청 본문은 `currentPassword`를 키로 사용
        const requestData: PasswordConfirmRequest = { currentPassword };
        const response = await apiClient.post<PasswordConfirmResponse>('/members/password/confirm', requestData);
        return response.data;
        } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || '현재 비밀번호 확인에 실패했습니다.');
        }
        throw new Error('네트워크 오류가 발생했습니다.');
        }
    },
    // 🆕 비밀번호 변경 API
    updatePassword: async (newPassword: string, confirmPassword: string): Promise<PasswordUpdateResponse> => {
        try {
        // API 문서에 따르면 요청 본문은 `newPassword`와 `confirmPassword`를 키로 사용
        const requestData: PasswordUpdateRequest = { newPassword, confirmPassword };
        const response = await apiClient.patch<PasswordUpdateResponse>('/members/password', requestData);
        return response.data;
        } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        }
        throw new Error('네트워크 오류가 발생했습니다.');
        }
    },
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
    },
        // 🆕 캘린더 메모 관련 API
    /**
     * 캘린더 메모 목록을 조회합니다.
     * GET /api/memos?year={year}&week={week}
     * @param year 조회할 연도
     * @param week 조회할 주차
     * @returns Promise<MemoItem[]> 메모 목록
     */
    getMemos: async (year: number, week: number): Promise<MemoItem[]> => {
        try {
            const response = await apiClient.get<{ data: MemoItem[] }>(`/memos?year=${year}&week=${week}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '메모 조회에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 월별 메모를 조회하는 API 함수 추가
    getMonthlyMemos: async (year: number, month: number, type: '다이어리' | '스케줄'): Promise<MemoItem[]> => {
        try {
            const response = await apiClient.get<MemoMonthlyResponse>(`/memos`, {
                params: { year, month, type }
            });
            return response.data.data.memos;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || '월별 메모 조회에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    /**
     * 새로운 캘린더 메모를 생성합니다.
     * POST /api/memos
     * @param payload 메모 생성 요청 페이로드
     * @returns Promise<MemoItem> 생성된 메모 정보
     */
    createMemo: async (payload: MemoPayload): Promise<MemoItem> => {
        try {
            const response = await apiClient.post<{ data: MemoItem }>('/memos', payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '메모 생성에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    /**
     * 기존 캘린더 메모를 수정합니다.
     * PUT /api/memos/{id}
     * @param payload 메모 수정 요청 페이로드 (id 포함)
     * @returns Promise<MemoItem> 수정된 메모 정보
     */
    updateMemo: async (payload: UpdateMemoPayload): Promise<MemoItem> => {
        try {
        // ✅ PUT 대신 PATCH 메서드를 사용하도록 수정
        const response = await apiClient.patch<{ data: MemoItem }>(`/memos/${payload.id}`, {
            content: payload.content,
            type: payload.type
        });
        return response.data.data;
        } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || '메모 수정에 실패했습니다.');
        }
        throw new Error('네트워크 오류가 발생했습니다.');
        }
    },


    /**
     * 캘린더 메모를 삭제합니다.
     * DELETE /api/memos/{id}
     * @param id 삭제할 메모 ID
     * @returns Promise<void>
     */
    deleteMemo: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/memos/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '메모 삭제에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    }
};

    // 🆕 태그 API - authAPI, calendarAPI와 동일한 패턴으로 구현
    export const tagAPI = {
    /**
     * 태그 목록 조회
     * GET /api/tags
     * @returns Promise<TagListResponse> 사용자의 모든 태그 목록
     */
    getTags: async (): Promise<TagListResponse> => {
        try {
            const response = await apiClient.get<TagListResponse>('/tags');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '태그 조회에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    /**
     * 태그 생성
     * POST /api/tags
     * @param tagData Tag 객체 (프론트엔드 형식)
     * @returns Promise<CreateTagResponse> 생성된 태그 정보
     */
    createTag: async (tagData: Tag): Promise<CreateTagResponse> => {
        try {
            // 프론트엔드 태그 형식을 서버 요청 형식으로 변환
            const requestData = transformFrontendTagToRequest(tagData);
            
            const response = await apiClient.post<CreateTagResponse>('/tags', requestData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '태그 등록에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    /**
     * 태그 수정
     * PUT /api/tags/{id}
     * @param tagId 수정할 태그의 ID (string)
     * @param tagData 수정할 태그 정보 (Tag 객체)
     * @returns Promise<UpdateTagResponse> 수정된 태그 정보
     */
    updateTag: async (tagId: string, tagData: Tag): Promise<UpdateTagResponse> => {
        try {
            // 프론트엔드 태그 형식을 서버 요청 형식으로 변환
            const requestData = transformFrontendTagToRequest(tagData);
            
            const response = await apiClient.put<UpdateTagResponse>(`/tags/${tagId}`, requestData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || '태그 수정에 실패했습니다.';
                throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    /**
     * 태그 삭제
     * DELETE /api/tags/{id}
     * @param tagId 삭제할 태그의 ID (string)
     * @returns Promise<DeleteTagResponse> 삭제 결과
     */
    deleteTag: async (tagId: string): Promise<DeleteTagResponse> => {
        try {
            const response = await apiClient.delete<DeleteTagResponse>(`/tags/${tagId}`);
            return response.data;
        } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || '태그 삭제에 실패했습니다.';
            throw new Error(errorMessage);
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    }
}

// 다이어리 API 객체
export const diaryApi = {
    // 1. 월간 다이어리 조회
    getMonthlyDiaries: async (year: number, month: number) => {
        try {
            const response = await apiClient.get(`/diaries`, {
                params: { year, month },
                withCredentials: true,
            });
            return response.data.body?.data?.diaryList ?? [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('월간 다이어리 데이터를 불러오지 못했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 2. 다이어리 상세 조회 + 락 토큰 획득
    getDiaryDetailWithLock: async (date: string) => {
        try {
            const detailRes = await apiClient.get(`/diaries/detail`, {
                params: { date },
                withCredentials: true,
            });

            const diaryId = detailRes.data?.id;
            let lockData = null;

            if (diaryId) {
                try {
                    const lockRes = await apiClient.post(`/locks/diaries/${diaryId}/acquire`, null, {
                        withCredentials: true,
                    });
                    lockData = lockRes.data;
                } catch {
                    console.warn('락 획득 실패');
                }
            }

            return {
                diary: detailRes.data,
                lock: lockData,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('다이어리 상세 데이터를 불러오지 못했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 3. 다이어리 등록
    createDiary: async (payload: any) => {
        try {
            const response = await apiClient.post(`/diaries`, payload, {
                withCredentials: true,
            });
            return response.data.body?.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('다이어리 등록에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 4. 다이어리 수정 (락 토큰 필요)
    updateDiary: async (id: number, payload: any, lockToken: string) => {
        try {
            const response = await apiClient.put(`/diaries/${id}`, payload, {
                headers: { 'X-Lock-Token': lockToken },
                withCredentials: true,
            });
            return response.data.body?.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('다이어리 수정에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 5. 다이어리 삭제
    deleteDiary: async (id: number) => {
        try {
            await apiClient.delete(`/diaries/${id}`, { withCredentials: true });
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('다이어리 삭제에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 6. 다이어리 태그 상태 변경 (수락 / 거절)
    updateDiaryTagStatus: async (tagId: number, tagStatus: '수락' | '거절') => {
        try {
            const response = await apiClient.put(`/diary-tags/${tagId}/status`, { tagStatus }, {
                withCredentials: true,
            });
            return response.data.body?.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('태그 상태 변경에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 7. 락 갱신
    renewDiaryLock: async (diaryId: number, lockToken: string) => {
        try {
            const response = await apiClient.post(`/locks/diaries/${diaryId}/renew`, null, {
                headers: { 'X-Lock-Token': lockToken },
                withCredentials: true,
            });
            return response.data;
        } catch {
            return { acquired: false };
        }
    },

    // 8. 락 해제
    releaseDiaryLock: async (diaryId: number, lockToken: string) => {
        try {
            await apiClient.post(`/locks/diaries/${diaryId}/release`, null, {
                headers: { 'X-Lock-Token': lockToken },
                withCredentials: true,
            });
            return true;
        } catch {
            console.warn('락 해제 실패');
            return false;
        }
    },

    // 9. 다이어리 이미지 임시 업로드
    uploadTempImage: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post(`/files/temp-upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('이미지 업로드에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },

    // 10. 친구 검색
    searchMembers: async (keyword: string) => {
        try {
            const response = await apiClient.get(`/members`, {
                params: { keyword },
                withCredentials: true,
            });
            return response.data; // message는 무시
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error('친구 검색에 실패했습니다.');
            }
            throw new Error('네트워크 오류가 발생했습니다.');
        }
    },
};

export default apiClient;