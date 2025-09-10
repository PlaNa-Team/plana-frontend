import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, MemberInfo } from '../../types/user.types';
import { authAPI } from '../../services/api';
import axios from 'axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
  isLoading: boolean;
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
  isLoading: false,
};

// 닉네임 업데이트를 위한 비동기 thunk 액션 생성
export const updateNicknameAsync = createAsyncThunk(
  'auth/updateNickname',
  async (newNickname: string, { getState, rejectWithValue }) => {
    try {
      // 현재 상태에서 사용자 정보 가져오기
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('사용자 정보를 찾을 수 없습니다.');
      }

      // 1. 닉네임 변경 API 호출
      await authAPI.updateNickname(newNickname);
      
      // 2. 기존 사용자 정보에서 닉네임만 업데이트 (API 응답 대신 직접 업데이트)
      const updatedUser: User = {
        ...currentUser,
        nickname: newNickname
      };
      
      return updatedUser;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || '닉네임 변경에 실패했습니다.');
      }
      return rejectWithValue('알 수 없는 오류가 발생했습니다.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; user: User; }>) => {
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
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload);
    },
    // 직접적인 닉네임 업데이트 (안전한 방식)
    updateUserNickname: (state, action: PayloadAction<string>) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          nickname: action.payload
        };
        state.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },
    // 전체 사용자 정보 업데이트 (기존 함수 개선)
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // updateNicknameAsync 처리
      .addCase(updateNicknameAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNicknameAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        // 안전하게 로컬스토리지에 업데이트된 사용자 정보 저장
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateNicknameAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  loginSuccess,
  logout,
  setError,
  clearError,
  setAccessToken,
  updateUser,
  updateUserNickname,
} = authSlice.actions;

export default authSlice.reducer;