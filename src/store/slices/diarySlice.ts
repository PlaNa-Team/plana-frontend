import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { diaryAPI } from '../../services/api';
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

interface DiaryState {
    currentMomentData: MomentData;
    currentMovieData: MovieData;
    currentBookData: BookData;
    selectedDate: string | null;
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
    tempImageUrl: null
};


const diarySlice = createSlice({
    name: 'diary',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        clearCurrentData: (state) => {
            state.currentMomentData = { title: '', location: '', memo: '' };
            state.currentMovieData = { title: '', director: '', actors: '', genre: '', releaseDate: '', rewatch: false, rating: 0, comment: '' };
            state.currentBookData = { title: '', author: '', genre: '', publisher: '', startDate: '', endDate: '', reread: false, rating: 0, comment: '' };
            state.currentDiaryDetail = null;
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
        clearError: (state) => {
            state.error = null;
        }
  },
    extraReducers: (builder) => {

  },
});

export const {
    setSelectedDate,
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    clearError
} = diarySlice.actions;

export default diarySlice.reducer;