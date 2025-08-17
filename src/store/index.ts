// Redux store 관련 - store 설정
// 중앙 저장소 설정
// 앱 전체에서 사용할 데이터를 한 곳에 모아서 관리

// API 연결할 때, createAsyncThunk 추가해야함


// Redux Toolkit의 스토어 설정 함수 가져오기
import { configureStore } from '@reduxjs/toolkit';
// React-Redux의 훅들 가져오기 ( 상태 읽기 / 변경용 )
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
// 각 Slice들 가져오기 ( 각 기능별 상태 관리 )
import authSlice from './slices/authSlice';
import calendarSlice from './slices/calendarSlice';
import diarySlice from './slices/diarySlice';
import projectSlice from './slices/projectSlice';
import themeSlice from './slices/themeSlice';
import notificationReducer from './slices/notiSlice';

// 전체 앱의 상태 저장소 설정
export const store = configureStore({
  reducer: {
    auth: authSlice,
    calendar: calendarSlice,
    diary: diarySlice,
    project: projectSlice,
    theme: themeSlice,
    notifications: notificationReducer,
  },
});

// 전체 상태의 타입 정의 ( TypeScript용 )
export type RootState = ReturnType<typeof store.getState>;
// dispatch 함수의 타입 정의 ( TypeScript용 )
export type AppDispatch = typeof store.dispatch;

// 타입이 지정된 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;