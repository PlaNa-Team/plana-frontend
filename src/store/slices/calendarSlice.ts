// store/slices/calendarSlice.ts - 공휴일 기능 추가된 버전

// Redux Toolkit의 상태 관리 함수들 가져오기
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// 공휴일 데이터 타입 정의
import { HolidayItem } from '../../types/calendar.types';

// 달력 관련 전체 상태의 타입 정의
interface CalendarState {
  events: any[];           // 달력에 표시될 이벤트들의 배열
  currentDate: string;     // 현재 달력에서 보고 있는 날짜 (ISO 문자열 형태)
  holidays: HolidayItem[]; // 공휴일 데이터 배열
  isLoadingHolidays: boolean; // 공휴일 데이터 로딩 중인지 여부
}

// Redux Slice 생성 - 달력 관련 상태와 액션들을 한 곳에서 관리
const calendarSlice = createSlice({
  name: 'calendar',  // 슬라이스의 이름 (Redux DevTools에서 식별용)
  
  // 초기 상태 설정
  initialState: { 
    events: [],                           // 빈 이벤트 배열로 시작
    currentDate: new Date().toISOString(), // 현재 시간을 ISO 문자열로 변환하여 저장
    holidays: [],                         // 빈 공휴일 배열로 시작
    isLoadingHolidays: false              // 처음에는 로딩 중이 아님
  } as CalendarState,  // 타입 명시
  
  // 상태를 변경하는 리듀서 함수들 정의
  reducers: {
    // 현재 달력 날짜를 업데이트하는 액션
    updateCurrentDate: (state, action: PayloadAction<{ start: string }>) => {
      // action.payload.start에는 새로운 날짜가 문자열 형태로 들어옴
      state.currentDate = action.payload.start;
    },
    
    // 달력 이벤트들을 설정하는 액션
    setEvents: (state, action: PayloadAction<any[]>) => {
      // action.payload에는 새로운 이벤트 배열이 들어옴
      state.events = action.payload;
    },
    
    // 공휴일 데이터를 설정하는 액션
    setHolidays: (state, action: PayloadAction<HolidayItem[]>) => {
      // action.payload에는 API에서 받아온 공휴일 배열이 들어옴
      state.holidays = action.payload;
    },
    
    // 공휴일 로딩 상태를 설정하는 액션
    setLoadingHolidays: (state, action: PayloadAction<boolean>) => {
      // action.payload에는 로딩 상태(true/false)가 들어옴
      state.isLoadingHolidays = action.payload;
    }
  }
});

// 액션 생성자 함수들을 내보내기
// 이 함수들을 컴포넌트에서 dispatch와 함께 사용하여 상태를 변경
export const {
  updateCurrentDate,    // 달력 날짜 변경 액션
  setEvents,           // 이벤트 설정 액션
  setHolidays,         // 공휴일 설정 액션
  setLoadingHolidays   // 공휴일 로딩 상태 변경 액션
} = calendarSlice.actions;

// Selector 함수들 - 컴포넌트에서 상태를 읽어올 때 사용
// useAppSelector와 함께 사용: const events = useAppSelector(selectEvents);

// 달력 이벤트 배열을 선택하는 셀렉터
export const selectEvents = (state: any) => state.calendar.events;

// 현재 달력 날짜를 선택하는 셀렉터
export const selectCurrentDate = (state: any) => state.calendar.currentDate;

// 공휴일 배열을 선택하는 셀렉터
export const selectHolidays = (state: any) => state.calendar.holidays;

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