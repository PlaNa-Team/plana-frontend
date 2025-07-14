// store/slices/calendarSlice.ts - 최소한만 남긴 버전
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 달력 관련 전체 상태의 타입 정의
interface CalendarState {
  events: any[];
  currentDate: Date;
}

const calendarSlice = createSlice({
  name: 'calendar',  // 슬라이스의 이름 (Redux DevTools에서 식별용)
  
  // 초기 상태 설정
  initialState: { 
    events: [], 
    currentDate: new Date() 
  } as CalendarState,
  reducers: {
    // 현재 달력 날짜를 업데이트하는 액션
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      state.currentDate = new Date(action.payload.start);
    },
    
    // 달력 이벤트들을 설정하는 액션
    setEvents: (state, action: PayloadAction<any[]>) => {
      // action.payload에는 새로운 이벤트 배열이 들어옴
      state.events = action.payload;
    }
  }
});

// 액션 생성자 함수들을 내보내기
// 이 함수들을 컴포넌트에서 dispatch와 함께 사용하여 상태를 변경
export const {
  updateCurrentDate,
  setEvents
} = calendarSlice.actions;

// Selector 함수들
export const selectEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectCurrentDate = (state: { calendar: CalendarState }) => state.calendar.currentDate;

// 공휴일 로딩 상태를 선택하는 셀렉터
export const selectIsLoadingHolidays = (state: any) => state.calendar.isLoadingHolidays;

// 리듀서 함수를 기본 내보내기
// store/index.ts에서 이 리듀서를 가져가서 전체 스토어에 등록함
export default calendarSlice.reducer;

/*
사용 예시:

1. 컴포넌트에서 상태 읽기:
   const events = useAppSelector(selectEvents);
   const holidays = useAppSelector(selectHolidays);
   const isLoading = useAppSelector(selectIsLoadingHolidays);

2. 컴포넌트에서 상태 변경:
   const dispatch = useAppDispatch();
   dispatch(setEvents(newEvents));
   dispatch(setHolidays(holidayData));
   dispatch(setLoadingHolidays(true));

3. 날짜 변경:
   dispatch(updateCurrentDate({ start: "2024-01-01T00:00:00.000Z" }));
*/