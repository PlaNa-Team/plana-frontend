import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  // refreshToken: string | null; // 향후 소셜로그인용
  error: string | null;
}

const getInitialTokens = () => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem('accessToken'),
      // refreshToken: localStorage.getItem('refreshToken'), // 향후 추가
    };
  }
  return { accessToken: null };
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
  // refreshToken: initialTokens.refreshToken, // 향후 추가
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      // refreshToken?: string; // 향후 소셜로그인용
      user: User;
    }>) => {
      state.accessToken = action.payload.accessToken;
      // state.refreshToken = action.payload.refreshToken || null; // 향후 추가
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      // if (action.payload.refreshToken) { // 향후 추가
      //   localStorage.setItem('refreshToken', action.payload.refreshToken);
      // }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      // state.refreshToken = null; // 향후 추가
      state.error = null;
      
      localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken'); // 향후 추가
      localStorage.removeItem('user');
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  loginSuccess,
  logout, 
  setError, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;