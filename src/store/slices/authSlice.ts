// Redux store 관련 - store 설정
// 로그인 상태 관리
// 특정 기능별로 상태를 나누어 관리 ( auth, calendar, diary, ... )

// Redux Toolkit의 slice 생성 함수와 액션 타입 가져오기
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 사용자 정보 타입 정의
interface User {
  id: string;     // 사용자 고유 ID
  email: string;  // 이메일
  name: string;   // 이름
}

// 인증 관련 상태들의 타입 정의
interface AuthState {
  user: User | null;        // 현재 로그인한 사용자 (없으면 null)
  isAuthenticated: boolean; // 로그인 상태 (true/false)
  error: string | null;     // 에러 메시지 (없으면 null)
}

// 시작할 때의 기본 상태
const initialState: AuthState = {
  user: null,            // 처음에는 로그인 안됨
  isAuthenticated: false, // 처음에는 인증 안됨
  error: null,           // 처음에는 에러 없음
};

const authSlice = createSlice({
  name: 'auth',     // slice 이름
  initialState,     // 초기 상태
  reducers: {       // 상태 변경 함수들
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;        // 사용자 정보 저장
      state.isAuthenticated = true;       // 로그인 상태로 변경
      state.error = null;                 // 에러 초기화
    },
    logout: (state) => {
      state.user = null;                  // 사용자 정보 삭제
      state.isAuthenticated = false;      // 로그아웃 상태로 변경
      state.error = null;                 // 에러 초기화
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;       // 에러 메시지 설정
    },
    clearError: (state) => {
      state.error = null;                 // 에러 메시지 지우기
    },
  },
});

// 액션 함수들을 다른 파일에서 사용할 수 있게 내보내기
export const { login, logout, setError, clearError } = authSlice.actions;

// reducer를 다른 파일에서 사용할 수 있게 내보내기
export default authSlice.reducer;