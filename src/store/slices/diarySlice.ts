// 다이어리 모드 관련 상태 관리

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { diaryAPI } from '../../services/api';
import {
  MonthlyDiaryItem,
  DiaryDetail,
  CreateDiaryRequest,
  UpdateDiaryRequest,
  DailyContent,
  MovieContent,
  BookContent
} from '../../types/diary.types';

interface MomentData {
  title: string;
  location: string;
  memo: string;
}

interface MovieData {
  title: string;
  director: string;
  genre: string;
  actors: string;
  releaseDate: string;
  rewatch: boolean;
  rating: number;
  comment: string;
}

interface BookData {
  title: string;
  author: string;
  genre: string;
  publisher: string;
  startDate: string;
  endDate: string;
  reread: boolean;
  rating: number;
  comment: string;
}

// 다이어리 모드에서 관리할 데이터 타입
interface DiaryState {
  currentMomentData: MomentData;
  currentMovieData: MovieData;
  currentBookData: BookData;
  selectedDate: string | null;
  // API 관련 상태 추가
  monthlyDiaries: MonthlyDiaryItem[];
  currentDiaryDetail: DiaryDetail | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  tempImageUrl: string | null;
}

const initialState: DiaryState = {
  currentMomentData: {
    title: '',
    location: '',
    memo: ''
  },
  currentMovieData: {
    title: '',
    director: '',
    genre: '',
    actors: '',
    releaseDate: '',
    rewatch: false,
    rating: 0,
    comment: ''
  },
  currentBookData: {
    title: '',
    author: '',
    genre: '',
    publisher: '',
    startDate: '',
    endDate: '',
    reread: false,
    rating: 0,
    comment: ''
  },
  selectedDate: null,
  monthlyDiaries: [],
  currentDiaryDetail: null,
  isLoading: false,
  isUploading: false,
  error: null,
  tempImageUrl: null,
};

// === Async Thunks ===

// 월간 다이어리 조회
export const fetchMonthlyDiaries = createAsyncThunk(
  'diary/fetchMonthlyDiaries',
  async ({ year, month }: { year: number; month: number }) => {
    const response = await diaryAPI.getMonthlyDiaries(year, month);

    console.log('=== 실제 응답 구조 ===');
    console.log('전체 response:', response);

    return response.body?.data?.diaryList || [];
  }
);

// 다이어리 상세 조회
export const fetchDiaryDetail = createAsyncThunk(
  'diary/fetchDiaryDetail',
  async (id: number) => {
    const response = await diaryAPI.getDiaryDetail(id);
    return response.data;
  }
);

// 이미지 임시 업로드
export const uploadTempImage = createAsyncThunk(
  'diary/uploadTempImage',
  async (file: File) => {
    const response = await diaryAPI.uploadTempImage(file);
    return response.data.tempUrl;
  }
);

// 다이어리 생성
export const createDiary = createAsyncThunk(
  'diary/createDiary',
  async (data: CreateDiaryRequest) => {
    const response = await diaryAPI.createDiary(data);
    return response.body.data;
  }
);

// 다이어리 수정
export const updateDiary = createAsyncThunk(
  'diary/updateDiary',
  async ({ id, data }: { id: number; data: UpdateDiaryRequest }) => {
    const response = await diaryAPI.updateDiary(id, data);
    return response.body.data;
  }
);

// 다이어리 삭제
export const deleteDiary = createAsyncThunk(
  'diary/deleteDiary',
  async (id: number) => {
    await diaryAPI.deleteDiary(id);
    return id;
  }
);

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    updateMomentData: (state, action: PayloadAction<Partial<MomentData>>) => {
      state.currentMomentData = { ...state.currentMomentData, ...action.payload };
    },
    updateMovieData: (state, action: PayloadAction<Partial<MovieData>>) => {
      state.currentMovieData = { ...state.currentMovieData, ...action.payload };
    },
    updateBookData: (state, action: PayloadAction<Partial<BookData>>) => {
      state.currentBookData = { ...state.currentBookData, ...action.payload };
    },
    clearCurrentData: (state) => {
      state.currentMomentData = initialState.currentMomentData;
      state.currentMovieData = initialState.currentMovieData;
      state.currentBookData = initialState.currentBookData;
      state.tempImageUrl = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // 다이어리 상세 데이터를 현재 편집 데이터로 로드
    loadDiaryToEdit: (state) => {
      if (!state.currentDiaryDetail) return;
      
      const diary = state.currentDiaryDetail;
      
      switch (diary.diaryType) {
        case 'DAILY':
          state.currentMomentData = {
            title: diary.title,
            location: (diary as any).location || '',
            memo: (diary as any).memo || ''
          };
          break;
        case 'MOVIE':
          state.currentMovieData = {
            title: diary.title,
            director: (diary as any).director || '',
            genre: (diary as any).genre || '',
            actors: (diary as any).actors || '',
            releaseDate: '', // API에서 releaseDate가 없으므로 빈 값
            rewatch: (diary as any).rewatch || false,
            rating: (diary as any).rating || 0,
            comment: (diary as any).comment || ''
          };
          break;
        case 'BOOK':
          state.currentBookData = {
            title: diary.title,
            author: (diary as any).author || '',
            genre: (diary as any).genre || '',
            publisher: (diary as any).publisher || '',
            startDate: (diary as any).startDate || '',
            endDate: (diary as any).endDate || '',
            reread: false, // API에서 reread가 없으므로 기본값
            rating: (diary as any).rating || 0,
            comment: (diary as any).comment || ''
          };
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 월간 다이어리 조회
      .addCase(fetchMonthlyDiaries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyDiaries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyDiaries = action.payload;
      })
      .addCase(fetchMonthlyDiaries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '데이터를 불러오는데 실패했습니다.';
      })
      
      // 다이어리 상세 조회
      .addCase(fetchDiaryDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiaryDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDiaryDetail = action.payload;
      })
      .addCase(fetchDiaryDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '상세 정보를 불러오는데 실패했습니다.';
      })
      
      // 이미지 임시 업로드
      .addCase(uploadTempImage.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadTempImage.fulfilled, (state, action) => {
        state.isUploading = false;
        state.tempImageUrl = action.payload;
      })
      .addCase(uploadTempImage.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message || '이미지 업로드에 실패했습니다.';
      })
      
      // 다이어리 생성
      .addCase(createDiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDiary.fulfilled, (state, action) => {
        state.isLoading = false;
        // 생성된 다이어리를 월간 리스트에 추가
        const newDiary: MonthlyDiaryItem = {
          id: action.payload.id,
          diaryDate: action.payload.diaryDate,
          diaryType: action.payload.diaryType,
          imageUrl: action.payload.imageUrl,
          title: action.payload.title
        };
        state.monthlyDiaries.push(newDiary);
      })
      .addCase(createDiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '다이어리 저장에 실패했습니다.';
      })
      
      // 다이어리 수정
      .addCase(updateDiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDiary.fulfilled, (state, action) => {
        state.isLoading = false;
        // 월간 리스트에서 해당 다이어리 업데이트
        const updatedDiary = action.payload;
        const index = state.monthlyDiaries.findIndex(d => d.id === updatedDiary.id);
        if (index !== -1) {
          state.monthlyDiaries[index] = {
            id: updatedDiary.id,
            diaryDate: updatedDiary.diaryDate,
            diaryType: updatedDiary.diaryType,
            imageUrl: updatedDiary.imageUrl,
            title: updatedDiary.title
          };
        }
        state.currentDiaryDetail = updatedDiary;
      })
      .addCase(updateDiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '다이어리 수정에 실패했습니다.';
      })
      
      // 다이어리 삭제
      .addCase(deleteDiary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDiary.fulfilled, (state, action) => {
        state.isLoading = false;
        // 월간 리스트에서 해당 다이어리 제거
        state.monthlyDiaries = state.monthlyDiaries.filter(d => d.id !== action.payload);
        state.currentDiaryDetail = null;
      })
      .addCase(deleteDiary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '다이어리 삭제에 실패했습니다.';
      });
  }
});

export const {
  setSelectedDate,
  updateMomentData,
  updateMovieData,
  updateBookData,
  clearCurrentData,
  clearError,
  loadDiaryToEdit
} = diarySlice.actions;

export default diarySlice.reducer;