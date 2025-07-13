// store/slices/calendarSlice.ts - 공휴일 기능 추가된 버전
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HolidayItem } from '../../types/calendar.types';

// 달력 상태 타입 정의
interface CalendarState {
  events: any[];
  currentDate: Date;
  holidays: HolidayItem[];
  isLoadingHolidays: boolean;
}

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { 
    events: [], 
    currentDate: new Date(),
    holidays: [],
    isLoadingHolidays: false
  } as CalendarState,
  reducers: {
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = new Date(action.payload.start);
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
export const selectEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectCurrentDate = (state: { calendar: CalendarState }) => state.calendar.currentDate;
export const selectHolidays = (state: { calendar: CalendarState }) => state.calendar.holidays;
export const selectIsLoadingHolidays = (state: { calendar: CalendarState }) => state.calendar.isLoadingHolidays;

// reducer 내보내기
export default calendarSlice.reducer;