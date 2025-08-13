// store/slices/calendarSlice.ts - 기존 타입 활용 버전
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { HolidayItem, CalendarEvent } from '../../types/calendar.types';
import { calendarAPI, transformSchedulesToEvents } from '../../services/api';

// 달력 상태 타입 정의
interface CalendarState {
  events: CalendarEvent[]; // calendar.types.ts의 CalendarEvent 사용
  currentDate: string;
  holidays: HolidayItem[];
  isLoadingHolidays: boolean;
  isLoadingEvents: boolean;
  eventsError: string | null;
  currentYear: number;
  currentMonth: number;
}

// 비동기 액션: 월간 일정 조회
export const fetchMonthlySchedules = createAsyncThunk(
  'calendar/fetchMonthlySchedules',
  async ({ year, month }: { year: number; month: number }) => {
    const response = await calendarAPI.getMonthlySchedules(year, month);
    return {
      events: transformSchedulesToEvents(response.data.schedules),
      year,
      month
    };
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { 
    events: [], 
    currentDate: new Date().toISOString(),
    holidays: [],
    isLoadingHolidays: false,
    isLoadingEvents: false,
    eventsError: null,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1
  } as CalendarState,
  reducers: {
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = action.payload.start;
      
      // 현재 년/월 업데이트
      const date = new Date(action.payload.start);
      state.currentYear = date.getFullYear();
      state.currentMonth = date.getMonth() + 1;
    },
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
    },
    setHolidays: (state, action: PayloadAction<HolidayItem[]>) => {
      state.holidays = action.payload;
    },
    setLoadingHolidays: (state, action: PayloadAction<boolean>) => {
      state.isLoadingHolidays = action.payload;
    },
    clearEventsError: (state) => {
      state.eventsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlySchedules.pending, (state) => {
        state.isLoadingEvents = true;
        state.eventsError = null;
      })
      .addCase(fetchMonthlySchedules.fulfilled, (state, action) => {
        state.isLoadingEvents = false;
        state.events = action.payload.events;
        state.currentYear = action.payload.year;
        state.currentMonth = action.payload.month;
      })
      .addCase(fetchMonthlySchedules.rejected, (state, action) => {
        state.isLoadingEvents = false;
        state.eventsError = action.error.message || '일정 조회에 실패했습니다.';
        state.events = []; // 에러 시 빈 배열
      });
  }
});

// 액션 함수들 내보내기
export const {
  updateCurrentDate,
  setEvents,
  setHolidays,
  setLoadingHolidays,
  clearEventsError
} = calendarSlice.actions;

// Selector 함수들
export const selectEvents = (state: any) => state.calendar.events;
export const selectCurrentDate = (state: any) => state.calendar.currentDate;
export const selectHolidays = (state: any) => state.calendar.holidays;
export const selectIsLoadingHolidays = (state: any) => state.calendar.isLoadingHolidays;
export const selectIsLoadingEvents = (state: any) => state.calendar.isLoadingEvents;
export const selectEventsError = (state: any) => state.calendar.eventsError;
export const selectCurrentYear = (state: any) => state.calendar.currentYear;
export const selectCurrentMonth = (state: any) => state.calendar.currentMonth;

// reducer 내보내기
export default calendarSlice.reducer;