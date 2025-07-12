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

export interface HolidayApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: HolidayItem[] | HolidayItem;
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}