// 다이어리 모드 관련 상태 관리

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
};

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>)=> {
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
    }
  }
});

export const {
  setSelectedDate,
  updateMomentData,
  updateMovieData,
  updateBookData,
  clearCurrentData
} = diarySlice.actions;

export default diarySlice.reducer;