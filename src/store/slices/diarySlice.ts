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

interface DiaryState {
    currentMomentData: DailyContent;
    currentMovieData: MovieContent;
    currentBookData: BookContent;
    selectedDate: string | null;
    monthlyDiaries: MonthlyDiaryItem[];
    currentDiaryDetail: DiaryDetail | null;
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
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
    currentDiaryDetail: null,
    isLoading: false,
    isUploading: false,
    error: null,
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

const diarySlice = createSlice({
    name: 'diary',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        clearCurrentData: (state) => {
            state.currentMomentData = { title: '', location: '', memo: '', imageUrl: '' };
            state.currentMovieData = { title: '', director: '', actors: '', genre: '', releaseDate: '', rewatch: false, rating: 0, comment: '', imageUrl: '' };
            state.currentBookData = { title: '', author: '', genre: '', publisher: '', startDate: '', endDate: '', reread: false, rating: 0, comment: '', imageUrl: '' };
            state.currentDiaryDetail = null;
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadTempImageAsync.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadTempImageAsync.fulfilled, (state, action) => {
                state.isUploading = false;
                const tempUrl = action.payload.data.tempUrl;
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
            });
    },
});

export const {
    setSelectedDate,
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    clearError,
} = diarySlice.actions;

export default diarySlice.reducer;