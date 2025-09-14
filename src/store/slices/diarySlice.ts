import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { diaryAPI, API_BASE_URL } from '../../services/api'
import {
    MonthlyDiaryItem,
    DiaryDetail,
    CreateDiaryRequest,
    UpdateDiaryRequest,
    DailyContent,
    MovieContent,
    BookContent,
    TempImageResponse,
    DiaryCreateResponse,
    MonthlyDiaryResponse,
    DiaryDetailResponse,
} from '../../types/diary.types';
import axios from 'axios';
import { RootState } from '..';

interface DiaryState {
    currentMomentData: DailyContent;
    currentMovieData: MovieContent;
    currentBookData: BookContent;
    selectedDate: string | null;
    monthlyDiaries: MonthlyDiaryItem[];
    currentDiaryDetail: DiaryDetailResponse | undefined;
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
    showSuccessToast: boolean;
    currentViewMonthAndYear: { year: number; month: number; }
}

const initialState: DiaryState = {
    currentMomentData: {
        title: '',
        location: '',
        memo: '',
        imageUrl: ''
    },
    currentMovieData: {
        title: '',
        director: '',
        genre: '',
        actors: '',
        releaseDate: '',
        rewatch: false,
        rating: 0,
        comment: '',
        imageUrl: ''
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
        comment: '',
        imageUrl: ''
    },
    selectedDate: null,
    monthlyDiaries: [],
    currentDiaryDetail: undefined,
    isLoading: false,
    isUploading: false,
    error: null,
    showSuccessToast: false,
    currentViewMonthAndYear: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
};

// 이미지 임시 업로드 Thunk
export const uploadTempImageAsync = createAsyncThunk<
    TempImageResponse, 
    { file: File; diaryType: 'DAILY' | 'MOVIE' | 'BOOK'}, 
    { rejectValue: string }
>('diary/uploadTempImage', async ({ file, diaryType }, { rejectWithValue }) => {
        try {
            const response = await diaryAPI.uploadTempImage(file);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// 다이어리 등록 Thunk
export const createDiaryAsync = createAsyncThunk<
    DiaryCreateResponse,
    { diaryData: CreateDiaryRequest },
    { rejectValue: string; state: RootState }
>(
    'diary/createDiary',
    async ({ diaryData }, { dispatch, rejectWithValue, getState }) => {
        try {
            const response = await diaryAPI.createDiary(diaryData);
            const { year, month } = getState().diary.currentViewMonthAndYear;

            await dispatch(getMonthlyDiariesAsync({ year, month }));
            return response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message ||   '다이어리 등록 실패');
            }
            return rejectWithValue('네트워크 오류');
        }
    }
);

// 월간 다이어리 조회 Thunk
export const getMonthlyDiariesAsync = createAsyncThunk<
    MonthlyDiaryResponse,
    { year: number; month: number; },
    { rejectValue: string }
>(
    'diary/getMonthlyDiaries',
    async ({ year, month }, { rejectWithValue }) => {
        try {
            const response = await diaryAPI.getMonthlyDiaries(year, month);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || '월간 다이어리 조회 실패');
            }
            return rejectWithValue('네트워크 오류');
        }
    }
);

const diarySlice = createSlice({
    name: 'diary',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        clearCurrentData: (state) => {
            state.currentMomentData = initialState.currentMomentData;
            state.currentMovieData = initialState.currentMovieData;
            state.currentBookData = initialState.currentBookData;
        },
        updateMomentData: (state, action: PayloadAction<Partial<DailyContent>>) => {
            state.currentMomentData = { ...state.currentMomentData, ...action.payload };
        },
        updateMovieData: (state, action: PayloadAction<Partial<MovieContent>>) => {
            state.currentMovieData = { ...state.currentMovieData, ...action.payload };
        },
        updateBookData: (state, action: PayloadAction<Partial<BookContent>>) => {
            state.currentBookData = { ...state.currentBookData, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        hideSuccessToast: (state) => {
            state.showSuccessToast = false;
        },
        // 현재 캘린더의 연월 업데이트 액션
        setCurrentViewMonthAndYear: (state, action: PayloadAction<{ year: number; month: number }>) => {
            state.currentViewMonthAndYear = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadTempImageAsync.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadTempImageAsync.fulfilled, (state, action) => {
                state.isUploading = false;
                const tempUrl = action.payload.data.url;
                const baseDomain = API_BASE_URL.replace('/api', '');
                const fullUrl = `${baseDomain}${tempUrl}`;

                const { diaryType } = action.meta.arg;

                switch (diaryType) {
                    case 'DAILY':
                        state.currentMomentData.imageUrl = fullUrl;
                        break;
                    case 'MOVIE':
                        state.currentMovieData.imageUrl = fullUrl;
                        break;
                    case 'BOOK':
                        state.currentBookData.imageUrl = fullUrl;
                        break;
                }
            })
            .addCase(uploadTempImageAsync.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.payload as string;
            })
            .addCase(createDiaryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDiaryAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDiaryDetail = action.payload.body.data;
                state.showSuccessToast = true;
                state.currentMomentData = initialState.currentMomentData;
                state.currentMovieData = initialState.currentMovieData;
                state.currentBookData = initialState.currentBookData;
                state.selectedDate = null;
            })
            .addCase(createDiaryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(getMonthlyDiariesAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMonthlyDiariesAsync.fulfilled, (state, action) => {
                const rawList = action.payload.body.data.diaryList;
            
                const processedList = rawList.map(d => ({
                    ...d,
                    diaryDate: d.diaryDate.split('T')[0]
                }));
              
                state.monthlyDiaries = processedList;
                state.isLoading = false;
            })
            .addCase(getMonthlyDiariesAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.monthlyDiaries = [];
            })
    }
});

export const {
    setSelectedDate,
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    clearError,
    hideSuccessToast,
    setCurrentViewMonthAndYear,
} = diarySlice.actions;

export default diarySlice.reducer;