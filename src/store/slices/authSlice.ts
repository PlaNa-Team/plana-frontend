// Redux store 관련 - store 설정
// 로그인 상태 관리 + 토큰 관리 추가
// 특정 기능별로 상태를 나누어 관리 ( auth, calendar, diary, ... )

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 사용자 정보 타입 정의 (확장)
interface User {
  id: string;       // 사용자 고유 ID
  email: string;    // 이메일
  name: string;     // 이름
  nickname?: string; // 닉네임 (선택적)
}

// 인증 관련 상태들의 타입 정의 (토큰 추가)
interface AuthState {
  user: User | null;        // 현재 로그인한 사용자 (없으면 null)
  isAuthenticated: boolean; // 로그인 상태 (true/false)
  accessToken: string | null;  // ✅ 액세스 토큰 추가
  refreshToken: string | null; // ✅ 리프레시 토큰 추가
  error: string | null;     // 에러 메시지 (없으면 null)
}

// ✅ localStorage에서 초기 토큰 로드하는 함수
const getInitialTokens = () => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }
  return { accessToken: null, refreshToken: null };
};

// ✅ localStorage에서 사용자 정보 로드하는 함수
const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialTokens = getInitialTokens();
const initialUser = getInitialUser();

// 시작할 때의 기본 상태 (새로고침해도 토큰 유지)
const initialState: AuthState = {
  user: initialUser,               // localStorage에서 사용자 정보 복원
  isAuthenticated: !!initialTokens.accessToken, // 토큰이 있으면 인증된 상태
  accessToken: initialTokens.accessToken,       // localStorage에서 토큰 복원
  refreshToken: initialTokens.refreshToken,     // localStorage에서 리프레시 토큰 복원
  error: null,                     // 처음에는 에러 없음
};

const authSlice = createSlice({
  name: 'auth',     // slice 이름
  initialState,     // 초기 상태
  reducers: {       // 상태 변경 함수들
    
    // ✅ 로그인 성공시 토큰과 사용자 정보 저장
    loginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      
      // ✅ localStorage에도 저장 (새로고침 대비)
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    // ✅ 토큰만 업데이트 (토큰 갱신시 사용)
    updateTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken?: string;
    }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      
      // localStorage 업데이트
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    
    // ✅ 기존 login 액션 (호환성 유지)
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;        // 사용자 정보 저장
      state.isAuthenticated = true;       // 로그인 상태로 변경
      state.error = null;                 // 에러 초기화
      
      // localStorage에 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    
    // ✅ 로그아웃 (모든 정보 삭제)
    logout: (state) => {
      state.user = null;                  // 사용자 정보 삭제
      state.isAuthenticated = false;      // 로그아웃 상태로 변경
      state.accessToken = null;           // 토큰 삭제
      state.refreshToken = null;          // 리프레시 토큰 삭제
      state.error = null;                 // 에러 초기화
      
      // ✅ localStorage 완전 클리어
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    
    // ✅ 에러 설정
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;       // 에러 메시지 설정
    },
    
    // ✅ 에러 클리어
    clearError: (state) => {
      state.error = null;                 // 에러 메시지 지우기
    },
  },
});

// 액션 함수들을 다른 파일에서 사용할 수 있게 내보내기
export const { 
  loginSuccess,   // ✅ refresh_token 포함
  updateTokens,   // ✅ 토큰 갱신용
  login,          // 기존 액션 (호환성 유지)
  logout, 
  setError, 
  clearError 
} = authSlice.actions;

// reducer를 다른 파일에서 사용할 수 있게 내보내기
export default authSlice.reducer;