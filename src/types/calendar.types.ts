import { MemoType } from './diary.types'; // ✅ 다이어리 타입 파일에서 MemoType을 가져옴


// TypeScript 타입 정의 - 캘린더 관련 타입
export interface Schedule {
  id: number;
  memberId: number;
  categoryId: number;
  title: string;
  color?: string;
  description?: string;
  startAt: string;
  endAt?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  recurrenceUntil?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export type NotifyUnit = 'MIN' | 'HOUR' | 'DAY';

export interface ScheduleAlarm {
  id: number;
  scheduleId: number;
  notifyBeforeVal?: number;
  notifyUnit?: NotifyUnit;
}

export type AlarmType = 'TAG' | 'ALARM';

export interface UnifiedAlarm {
  id: number;
  alarmId?: number;
  tagId?: number;
  memberId: number;
  type: AlarmType;
  time: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export type TagStatus = '작성자' | '수락' | '거절' | '삭제' | '미설정';

export interface DiaryTag {
  id: number;
  memberId?: number;
  diaryId: number;
  tagText?: string;
  tagStatus: TagStatus;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  isDeleted?: string | boolean;
}

export interface HolidayItem {
  dateKind: string;     // ex: "01"
  dateName: string;     // ex: "추석"
  isHoliday: string;    // "Y" | "N"
  locdate: number;      // ex: 20250926
  seq: number;
}

// API 응답 타입을 더 안전하게 정의
export interface HolidayApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body?: {  // body를 선택적으로 만듦
      items?: {  // items도 선택적으로 만듦
        item?: HolidayItem[] | HolidayItem;  // item도 선택적으로 만듦
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

// 월간 일정 조회 API 응답 타입
export interface MonthlyScheduleResponse {
  status: number;
  message: string;
  data: {
    year: number;
    month: number;
    schedules: Array<{
      id: number;
      title: string;
      startAt: string;
      endAt?: string;
      isAllDay: boolean;
      color: string;
      isRecurring: boolean;
      // ✅ 누락된 속성들을 여기에 추가
      categoryId: number;
      categoryName: string;
      isDeleted: boolean;
      virtualId?: string;
    }>;
  };
}

// FullCalendar 이벤트 형식 (기존 Schedule과 구분하기 위해)
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    categoryName?: string;
    isRecurring?: boolean;
    originalId?: number;
  };
}

// 태그 인터페이스 (기존 유지 - 프론트엔드용)
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// 🆕 서버 태그 응답 인터페이스 (API 응답용)
export interface ServerTag {
  id: number;
  name: string;
  color: string;
}

// 🆕 태그 목록 조회 API 응답 타입
export interface TagListResponse {
  status: number;
  message: string;
  data: ServerTag[];
}

// 🆕 태그 생성 API 요청 타입
export interface CreateTagRequest {
  name: string;
  color: string;
}

// 🆕 태그 생성 API 응답 타입
export interface CreateTagResponse {
  status: number;
  message: string;
  data: {
    id: number;
    name: string;
    color: string;
  };
}

// 🆕 태그 수정 API 요청 타입
export interface UpdateTagRequest {
  name: string;
  color: string;
}

// 🆕 태그 수정 API 응답 타입
export interface UpdateTagResponse {
  status: number;
  message: string;
  data: {
    id: number;
    name: string;
    color: string;
  };
}

// 🆕 태그 삭제 API 응답 타입
export interface DeleteTagResponse {
  status: number;
  message: string;
}

// 일정 추가/수정 모달에서 사용할 데이터 타입
export interface ScheduleFormData {
  id?: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  color: string;
  categoryId?: number; // 🔧 숫자로 통일
  category?: string; // 🔧 기존 호환성 유지 (deprecated)
  description?: string;
  location?: string;
  memo?: string;
  repeatValue?: string;
  alarmValue?: string;
  tags?: Tag[];
}

// 일정 상세 조회 API 응답 타입
export interface ScheduleDetailResponse {
  status: number;
  message: string;
  data: {
    id: number;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    color: string;
    location?: string;
    memo?: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    recurrenceUntil?: string;
     category?: {
        id: number;
        name: string;
        color: string;
    };
    tags?: Array<{
      id: number;
      name: string;
      color: string;
    }>;
    alarms?: Array<{
      id: number;
      notifyBeforeVal: number;
      notifyUnit: 'MIN' | 'HOUR' | 'DAY';
    }>;
  };
}

export interface DayEvent {
  id: string;
  title: string;
  time: string;
  category: 'meeting' | 'personal' | 'work';
  description?: string;
  color?: string;
}

// 일정 생성 응답 인터페이스만 정의 (요청은 변환 함수에서 처리)
export interface CreateScheduleResponse {
  status: number;
  message: string;
  data: {
    id: number;
    title: string;
    color: string;
    description?: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurrenceRule?: string;
    recurrenceUntil?: string;
    category: {
      id: number;
      name: string;
      color: string;
    };
    alarms: Array<{
      notifyBeforeVal: number;
      notifyUnit: 'MIN' | 'HOUR' | 'DAY';
    }>;
  };
}

// 수정 API 응답 타입만 추가
export interface UpdateScheduleResponse {
  status: number;
  message: string;
  data: {
    id: number;
    title: string;
    color: string;
    description?: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurrenceRule?: string;
    recurrenceUntil?: string;
    category: {
      id: number;
      name: string;
      color: string;
    };
    alarms: Array<{
      notifyBeforeVal: number;
      notifyUnit: 'MIN' | 'HOUR' | 'DAY';
    }>;
  };
}

// 캘린더 메모 아이템 (API 응답)
export interface MemoItem {
  id: number;
  year: number;
  week: number;
  content: string;
  type: MemoType; 
  createdAt?: string;
  updatedAt?: string;
}

// 캘린더 메모 요청 payload (등록)
export interface MemoPayload {
  content: string;
  year: number;
  week: number;
  type: MemoType;
}

// 캘린더 메모 수정 요청 payload
export interface UpdateMemoPayload {
  id: number;
  content: string;
  type: MemoType;
}

export interface MemoMonthlyResponse {
    status: number;
    message: string;
    data: {
        memos: MemoItem[];
        // 백엔드 응답에 다른 필드가 있다면 여기에 추가
    };
}

// 일정 삭제 API 응답 타입
export interface DeleteScheduleResponse {
  status: number;
  message: string;
}