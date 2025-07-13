// store/slices/calendarSlice.ts - 공휴일 기능 추가된 버전
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HolidayItem } from '../../types/calendar.types';

// 달력 상태 타입 정의
interface CalendarState {
  events: any[];
  currentDate: string; // Date 대신 string 사용
  holidays: HolidayItem[];
  isLoadingHolidays: boolean;
}

// RootState 타입 정의 (임시)
interface RootState {
  calendar: CalendarState;
}

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { 
    events: [], 
    currentDate: new Date().toISOString(), // string으로 저장
    holidays: [],
    isLoadingHolidays: false
  } as CalendarState,
  reducers: {
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = action.payload.start;
    },
    setEvents: (state, action: PayloadAction<any[]>) => {
      state.events = action.payload;
    },
    setHolidays: (state, action: PayloadAction<HolidayItem[]>) => {
      state.holidays = action.payload;
    },
    setLoadingHolidays: (state, action: PayloadAction<boolean>) => {
      state.isLoadingHolidays = action.payload;
    }
  }
});

// 액션 함수들 내보내기
export const {
  updateCurrentDate,
  setEvents,
  setHolidays,
  setLoadingHolidays
} = calendarSlice.actions;

// Selector 함수들
export const selectEvents = (state: RootState) => state.calendar.events;
export const selectCurrentDate = (state: RootState) => state.calendar.currentDate;
export const selectHolidays = (state: RootState) => state.calendar.holidays;
export const selectIsLoadingHolidays = (state: RootState) => state.calendar.isLoadingHolidays;

// reducer 내보내기
export default calendarSlice.reducer;