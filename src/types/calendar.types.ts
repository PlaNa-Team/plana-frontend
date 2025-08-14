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
      endAt: string;
      isAllDay: boolean;
      color: string;
      isRecurring: boolean;
      categoryName: string;
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

// 태그 인터페이스
export interface Tag {
  id: string;
  name: string;
  color: string;
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
  category: string;
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
    categoryId: number;
    categoryName: string;
    tags: Array<{
      id: number;
      name: string;
      color: string;
    }>;
    alarms: Array<{
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