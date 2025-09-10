import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User , MemberInfo } from '../../types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
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
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      user: User;
    }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.error = null;
      
      localStorage.removeItem('accessToken');
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
    updateUser: (state, action: PayloadAction<MemberInfo>) => {
      if (state.user) {
        // 기존 user의 필수 속성을 명시적으로 유지
        const updatedUser: User = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          loginId: action.payload.login_id,
          nickname: action.payload.nickname,
          provider: action.payload.provider as any,
          createdAt: action.payload.created_at,
          
          // API 응답에 없는 필수 필드는 기존 state에서 가져와 할당
          password: state.user.password,
          updatedAt: state.user.updatedAt,
          isDeleted: state.user.isDeleted,
        };

        state.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },

  },
});

export const { 
  loginSuccess,
  logout, 
  setError, 
  clearError,
  setAccessToken,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;