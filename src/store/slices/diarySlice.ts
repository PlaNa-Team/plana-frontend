// 다이어리 모드 관련 상태 관리

import { createSlice } from '@reduxjs/toolkit';

// 다이어리 모드에서 관리할 데이터 타입
interface DiaryState {
  entries: any[];
  selectedDate: string | null;
}

const initialState: DiaryState = {
    // 다이어리 목록 ( 나중에 구체적으로 정의 )
  entries: [],
    // 현재 선택된 날짜
  selectedDate: null,
};

const diarySlice = createSlice({
  name: 'diary',
    // 시작할 때의 기본 값 (빈 배열, null )
  initialState,
  reducers: {
    // 날짜 선택하는 함수
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

export const { setSelectedDate } = diarySlice.actions;
export default diarySlice.reducer;