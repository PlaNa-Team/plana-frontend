import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { HolidayItem, CalendarEvent } from '../../types/calendar.types';
import { calendarAPI, transformSchedulesToEvents } from '../../services/api';

// 달력 상태 타입 정의
interface CalendarState {
  events: CalendarEvent[];
  searchedEvents: CalendarEvent[];
  isLoadingSearches: boolean;
  searchesError: string | null;
  currentDate: string;
  holidays: HolidayItem[];
  isLoadingHolidays: boolean;
  isLoadingEvents: boolean;
  eventsError: string | null;
  currentYear: number;
  currentMonth: number;
  // ✅ 삭제: isLoadingMemos 상태
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

// 비동기 액션: 일정 삭제
export const deleteSchedule = createAsyncThunk(
  'calendar/deleteSchedule',
  async ({ eventId, year, month }: { eventId: string; year: number; month: number }, { dispatch }) => {
    await calendarAPI.deleteSchedule(eventId);
    await dispatch(fetchMonthlySchedules({ year, month }));
    return eventId;
  }
);

export const fetchSearchedSchedules = createAsyncThunk(
  'calendar/fetchSearchedSchedules',
  async (keyword: string) => {
    const responseData = await calendarAPI.searchSchedules(keyword);
    const transformedEvents = transformSchedulesToEvents(responseData.schedules || responseData);
    return transformedEvents;
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { 
    events: [], 
    currentDate: new Date().toISOString(),
    searchedEvents: [],
    isLoadingSearches: false,
    searchesError: null,
    holidays: [],
    isLoadingHolidays: false,
    isLoadingEvents: false,
    eventsError: null,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    // ✅ 삭제: isLoadingMemos 초기값
  } as CalendarState,
  reducers: {
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = action.payload.start;
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
    },
    clearSearchedEvents: (state) => {
      state.searchedEvents = [];
    },
    // ✅ 삭제: setLoadingMemos 리듀서
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
        state.events = [];
      })
       .addCase(deleteSchedule.fulfilled, (state) => {
        console.log('일정이 성공적으로 삭제되었습니다.');
      })
       .addCase(fetchSearchedSchedules.pending, (state) => {
        state.isLoadingSearches = true;
        state.searchesError = null;
        state.searchedEvents = [];
      })
      .addCase(fetchSearchedSchedules.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.isLoadingSearches = false;
        state.searchedEvents = action.payload;
      })
      .addCase(fetchSearchedSchedules.rejected, (state, action) => {
        state.isLoadingSearches = false;
        state.searchesError = action.payload as string || '일정 검색에 실패했습니다.';
        state.searchedEvents = [];
      });
  }
});

// 액션 함수들 내보내기
export const {
  updateCurrentDate,
  setEvents,
  setHolidays,
  setLoadingHolidays,
  clearEventsError,
  // ✅ 삭제: setLoadingMemos 액션 내보내기
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
export const { clearSearchedEvents } = calendarSlice.actions;
export const selectSearchedEvents = (state: any) => state.calendar.searchedEvents;
export const selectIsLoadingSearches = (state: any) => state.calendar.isLoadingSearches;
export const selectSearchesError = (state: any) => state.calendar.searchesError;
// ✅ 삭제: selectIsLoadingMemos 셀렉터

// reducer 내보내기
export default calendarSlice.reducer;