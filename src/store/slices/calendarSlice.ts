// 캘린더 모드 관련 상태 관리

// Redux Toolkit의 slice 생성 함수 가져오기
import { createSlice } from '@reduxjs/toolkit';

// 달력 관련 상태들의 타입 정의
interface CalendarState {
  events: any[];  // 달력 이벤트들 ( 나중에 구체적으로 정의 )
  selectedDate: string | null;   // 현재 선택된 날짜 ( 없으면 Null )
}

// 시작할 때의 기본 상태
const initialState: CalendarState = {
  events: [],   // 처음에는 이벤트 없음
  selectedDate: null,   // 처음에는 선택된 날짜 없음
};

const calendarSlice = createSlice({
  name: 'calendar',   // slice 이름
  initialState,   // 초기 상태
  reducers: {    // 상태 변경 함수들
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;   // 선택된 날짜 변경
    },
  },
});

// 액션 함수를 다른 파일에서 사용할 수 있게 내보내기
export const { setSelectedDate } = calendarSlice.actions;
// reducer를 다른 파일에서 사용할 수 있게 내보내기
export default calendarSlice.reducer;