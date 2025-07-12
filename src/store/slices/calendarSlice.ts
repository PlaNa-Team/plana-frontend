// store/slices/calendarSlice.ts - 최소한만 남긴 버전
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 달력 상태 타입 정의
interface CalendarState {
  events: any[];
  currentDate: Date;
}

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { 
    events: [], 
    currentDate: new Date() 
  } as CalendarState,
  reducers: {
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = new Date(action.payload.start);
    },
    setEvents: (state, action: PayloadAction<any[]>) => {
      state.events = action.payload;
    }
  }
});

// 액션 함수들 내보내기
export const {
  updateCurrentDate,
  setEvents
} = calendarSlice.actions;

// Selector 함수들
export const selectEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectCurrentDate = (state: { calendar: CalendarState }) => state.calendar.currentDate;

// reducer 내보내기
export default calendarSlice.reducer;