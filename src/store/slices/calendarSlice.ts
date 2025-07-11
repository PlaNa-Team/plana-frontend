// store/slices/calendarSlice.ts - 확장된 캘린더 상태 관리
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// diary.types.ts에서 가져온 메모 관련 타입들
export type MemoType = '다이어리' | '스케줄';

export interface Memo {
  id: number;
  memberId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  year: number;
  week: number;
  type: MemoType;
}

// 달력 관련 상태들의 타입 정의
interface CalendarState {
  // 기존
  events: any[];
  selectedDate: string | null;
  
  // 추가: 현재 캘린더 날짜 상태
  currentDate: Date;
  currentYear: number;
  currentMonth: number;
  
  // 추가: 주차별 메모 관리 (diary.types.ts의 Memo 타입 활용)
  weeklyMemos: { [key: string]: string }; // key: "year-month-weekNumber", value: content
  fullMemos: Memo[]; // 전체 메모 데이터 (API에서 받아올 때 사용)
  editingWeek: number | null;
  memoInputs: { [weekNumber: number]: string };
}

// 유틸리티 함수들
const getWeekNumber = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

const getWeeksInMonth = (year: number, month: number): number => {
  const lastDay = new Date(year, month + 1, 0);
  return getWeekNumber(lastDay);
};

const createMemoKey = (year: number, month: number, weekNumber: number): string => {
  return `${year}-${month}-${weekNumber}`;
};

// 🆕 연도별 주차를 월별 주차로 변환하는 유틸리티 함수들
const getMonthFromWeek = (year: number, week: number): number => {
  // 해당 연도의 첫 번째 날
  const firstDayOfYear = new Date(year, 0, 1);
  // 해당 주차의 첫 번째 날 계산
  const daysToAdd = (week - 1) * 7;
  const targetDate = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return targetDate.getMonth() + 1; // 1-12월
};

const getWeekInMonth = (year: number, week: number): number => {
  // 해당 연도의 첫 번째 날
  const firstDayOfYear = new Date(year, 0, 1);
  // 해당 주차의 첫 번째 날 계산
  const daysToAdd = (week - 1) * 7;
  const targetDate = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  
  // 해당 월의 첫 번째 날
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const dayOfMonth = targetDate.getDate();
  
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

// 시작할 때의 기본 상태
const now = new Date();
const initialState: CalendarState = {
  // 기존
  events: [],
  selectedDate: null,
  
  // 추가: 현재 날짜 상태
  currentDate: now,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  
  // 추가: 메모 관리 (diary.types.ts의 Memo 타입 활용)
  weeklyMemos: {},
  fullMemos: [], // 전체 메모 데이터
  editingWeek: null,
  memoInputs: {}
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // === 기존 액션 ===
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    
    // === 새로운 액션들 ===
    
    // 현재 캘린더 날짜 업데이트 (월 변경 시)
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      const newDate = new Date(action.payload.start);
      state.currentDate = newDate;
      state.currentYear = newDate.getFullYear();
      state.currentMonth = newDate.getMonth() + 1;
      
      // 월 변경 시 편집 모드 해제
      state.editingWeek = null;
      state.memoInputs = {};
    },
    
    // 메모 컬럼 표시/숨김 기능 제거
    
    // 메모 편집 시작
    startEditingMemo: (state, action: PayloadAction<number>) => {
      const weekNumber = action.payload;
      const memoKey = createMemoKey(state.currentYear, state.currentMonth, weekNumber);
      const existingMemo = state.weeklyMemos[memoKey] || '';
      
      state.editingWeek = weekNumber;
      state.memoInputs = {
        ...state.memoInputs,
        [weekNumber]: existingMemo
      };
    },
    
    // 메모 입력 값 업데이트
    updateMemoInput: (state, action: PayloadAction<{ weekNumber: number; content: string }>) => {
      const { weekNumber, content } = action.payload;
      state.memoInputs[weekNumber] = content;
    },
    
    // 메모 저장
    saveMemo: (state, action: PayloadAction<{ weekNumber: number; content: string }>) => {
      const { weekNumber, content } = action.payload;
      const memoKey = createMemoKey(state.currentYear, state.currentMonth, weekNumber);
      
      // 메모 저장
      state.weeklyMemos[memoKey] = content;
      
      // 편집 상태 리셋
      state.editingWeek = null;
      delete state.memoInputs[weekNumber];
    },
    
    // 메모 편집 취소
    cancelEditingMemo: (state, action: PayloadAction<number>) => {
      const weekNumber = action.payload;
      state.editingWeek = null;
      delete state.memoInputs[weekNumber];
    },
    
    // 메모 삭제
    deleteMemo: (state, action: PayloadAction<{ year: number; month: number; weekNumber: number }>) => {
      const { year, month, weekNumber } = action.payload;
      const memoKey = createMemoKey(year, month, weekNumber);
      delete state.weeklyMemos[memoKey];
    },
    
    // 전체 메모 데이터 설정 (API에서 불러올 때)
    setWeeklyMemos: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.weeklyMemos = action.payload;
    },
    
    // 🆕 전체 메모 데이터 설정 (Memo 타입 사용)
    setFullMemos: (state, action: PayloadAction<Memo[]>) => {
      state.fullMemos = action.payload;
      
      // fullMemos를 weeklyMemos 형태로 변환해서 저장
      const weeklyMemosMap: { [key: string]: string } = {};
      action.payload.forEach(memo => {
        if (!memo.isDeleted && memo.type === '스케줄') {
          // year-month-week 형태로 키 생성 (memo.week을 month 내 주차로 변환 필요)
          const memoKey = createMemoKey(memo.year, getMonthFromWeek(memo.year, memo.week), getWeekInMonth(memo.year, memo.week));
          weeklyMemosMap[memoKey] = memo.content;
        }
      });
      state.weeklyMemos = weeklyMemosMap;
    },
    
    // 이벤트 관리
    addEvent: (state, action: PayloadAction<any>) => {
      state.events.push(action.payload);
    },
    
    updateEvent: (state, action: PayloadAction<{ id: string; updates: any }>) => {
      const { id, updates } = action.payload;
      const eventIndex = state.events.findIndex(event => event.id === id);
      if (eventIndex !== -1) {
        state.events[eventIndex] = { ...state.events[eventIndex], ...updates };
      }
    },
    
    removeEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      state.events = state.events.filter(event => event.id !== eventId);
    },
    
    setEvents: (state, action: PayloadAction<any[]>) => {
      state.events = action.payload;
    }
  }
});

// === 액션 함수들 내보내기 ===
export const {
  // 기존
  setSelectedDate,
  
  // 새로운 액션들
  updateCurrentDate,
  startEditingMemo,
  updateMemoInput,
  saveMemo,
  cancelEditingMemo,
  deleteMemo,
  setWeeklyMemos,
  setFullMemos,
  addEvent,
  updateEvent,
  removeEvent,
  setEvents
} = calendarSlice.actions;

// === Selector 함수들 (상태 선택자) ===
export const selectCalendarState = (state: { calendar: CalendarState }) => state.calendar;
export const selectCurrentDate = (state: { calendar: CalendarState }) => state.calendar.currentDate;
export const selectCurrentYear = (state: { calendar: CalendarState }) => state.calendar.currentYear;
export const selectCurrentMonth = (state: { calendar: CalendarState }) => state.calendar.currentMonth;
export const selectWeeklyMemos = (state: { calendar: CalendarState }) => state.calendar.weeklyMemos;
export const selectFullMemos = (state: { calendar: CalendarState }) => state.calendar.fullMemos;
export const selectEditingWeek = (state: { calendar: CalendarState }) => state.calendar.editingWeek;
export const selectMemoInputs = (state: { calendar: CalendarState }) => state.calendar.memoInputs;
export const selectEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectSelectedDate = (state: { calendar: CalendarState }) => state.calendar.selectedDate;

// 특정 주차의 메모를 가져오는 selector
export const selectMemoForWeek = (year: number, month: number, weekNumber: number) =>
  (state: { calendar: CalendarState }) => {
    const memoKey = createMemoKey(year, month, weekNumber);
    return state.calendar.weeklyMemos[memoKey] || '';
  };

// 현재 월의 주차 수를 계산하는 selector
export const selectWeeksInCurrentMonth = (state: { calendar: CalendarState }) => {
  return getWeeksInMonth(state.calendar.currentYear, state.calendar.currentMonth - 1);
};

// === 유틸리티 함수들 내보내기 ===
export { getWeekNumber, getWeeksInMonth, createMemoKey, getMonthFromWeek, getWeekInMonth };

// reducer 내보내기
export default calendarSlice.reducer;