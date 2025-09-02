import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  // refreshToken: string | null; // <-- 쿠키로 담기 떄문에 필요 없음제
  error: string | null;
}

const getInitialTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  }
  return { accessToken: null, refreshToken: null };
};

const getInitialUser = (): User | null => {
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

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialTokens.accessToken,
  accessToken: initialTokens.accessToken,
  // refreshToken: initialTokens.refreshToken, // <-- 쿠키로 담기 떄문에 필요 없음
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 3. loginSuccess 페이로드에 refreshToken 추가
    loginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      // refreshToken: string; // <-- 이 줄의 주석 해제
      user: User;
    }>) => {
      state.accessToken = action.payload.accessToken;
      // state.refreshToken = action.payload.refreshToken; // <-- 쿠키로 담기 떄문에 필요 없음
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      // 4. refreshToken이 있을 때 로컬 스토리지에 저장하는 if문 주석 해제
      // if (action.payload.refreshToken) {
      //   localStorage.setItem('refreshToken', action.payload.refreshToken);
      // }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    // 5. logout 로직에 refreshToken 추가
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      // state.refreshToken = null; // <-- 쿠키로 담기 떄문에 필요 없음
      state.error = null;
      
      localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken'); //<-- 쿠키로 담기 떄문에 필요 없음
      localStorage.removeItem('user');
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true; // 토큰 갱신 후에도 로그인 상태 유지
      localStorage.setItem('accessToken', action.payload);
    },
  },
});

export const { 
  loginSuccess,
  logout, 
  setError, 
  clearError,
  setAccessToken,
} = authSlice.actions;

export default authSlice.reducer;