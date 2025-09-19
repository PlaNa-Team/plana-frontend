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
    FriendItem,
    DiaryTagRequest,
    FriendSearchResponse,
} from '../../types/diary.types';
import axios from 'axios';
import { RootState } from '..';

interface DiaryState {
    currentMomentData: DailyContent;
    currentMovieData: MovieContent;
    currentBookData: BookContent;
    selectedDate: string | null;
    monthlyDiaries: MonthlyDiaryItem[];
    currentDiaryDetail: DiaryDetail | undefined;
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
    showSuccessToast: boolean;
    currentViewMonthAndYear: { year: number; month: number; };
    friendSearchResults: FriendItem[];
    selectedTags: DiaryTagRequest[];
    isSearching: boolean;
    searchError: string | null;
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
    friendSearchResults: [],
    selectedTags: [],
    isSearching: false,
    searchError: null,
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

// 다이어리 상세 조회 Thunk
export const getDiaryDetailAsync = createAsyncThunk<
    DiaryDetail,
    { date: string },
    { rejectValue: string }
>('diary/getDiaryDetail', async ({ date }, { rejectWithValue }) => {
    try {
        const response = await diaryAPI.getDiaryDetail(date);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// 다이어리 수정 Thunk
export const updateDiaryAsync = createAsyncThunk<
    DiaryCreateResponse,
    { id: number; diaryData: UpdateDiaryRequest },
    { rejectValue: string; state: RootState }
>(
    'diary/updateDiary',
    async ({ id, diaryData }, { dispatch, rejectWithValue, getState }) => {
        try {
            const response = await diaryAPI.updateDiary(id, diaryData);
            const { year, month } = getState().diary.currentViewMonthAndYear;
            await dispatch(getMonthlyDiariesAsync({ year, month })); // 수정 후 월간 다이어리 다시 불러오기
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// 다이어리 삭제 Thunk
export const deleteDiaryAsync = createAsyncThunk<
    void,
    number,
    { rejectValue: string; state: RootState }
>(
    'diary/deleteDiary',
    async (id, { dispatch, rejectWithValue, getState }) => {
        try {
            await diaryAPI.deleteDiary(id);
            // 삭제 후 캘린더를 새로고침
            const { year, month } = getState().diary.currentViewMonthAndYear;
            await dispatch(getMonthlyDiariesAsync({ year, month }));
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// 친구 검색 Thunk
export const searchMembersAsync = createAsyncThunk<
    FriendSearchResponse,
    string,
    { rejectValue: string }
>(
    'diary/searchMembers',
    async (keyword, { rejectWithValue }) => {
        try {
            const response = await diaryAPI.searchMembers(keyword);
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
        addTag: (state, action: PayloadAction<DiaryTagRequest>) => {
            if (!state.selectedTags.find(tag => tag.tagText === action.payload.tagText)) {
                state.selectedTags.push(action.payload);
            }
        },
        removeTag: (state, action: PayloadAction<string>) => {
            state.selectedTags = state.selectedTags.filter(tag => tag.tagText !== action.payload);
        },
        clearSearchResults: (state) => {
            state.friendSearchResults = [];
        },
        clearAllTags: (state) => {
            state.selectedTags = [];
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
            .addCase(getDiaryDetailAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDiaryDetailAsync.fulfilled, (state, action) => {
                const diaryDetail = action.payload;
                state.currentDiaryDetail = diaryDetail;
                state.isLoading = false;

                // 탭 타입에 따라 Redux 상태 업데이트
                if (diaryDetail.diaryType === 'DAILY') {
                    state.currentMomentData = { ...diaryDetail.content, imageUrl: diaryDetail.imageUrl };
                } else if (diaryDetail.diaryType === 'MOVIE') {
                    state.currentMovieData = { ...diaryDetail.content, imageUrl: diaryDetail.imageUrl };
                } else if (diaryDetail.diaryType === 'BOOK') {
                    state.currentBookData = { ...diaryDetail.content, imageUrl: diaryDetail.imageUrl };
                }
            })
            .addCase(getDiaryDetailAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateDiaryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDiaryAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.showSuccessToast = true;
                state.currentMomentData = initialState.currentMomentData;
                state.currentMovieData = initialState.currentMovieData;
                state.currentBookData = initialState.currentBookData;
                state.selectedDate = null;
            })
            .addCase(updateDiaryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteDiaryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDiaryAsync.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                state.showSuccessToast = true;
                state.currentDiaryDetail = undefined;
                state.selectedDate = null;
                state.currentMomentData = initialState.currentMomentData;
                state.currentMovieData = initialState.currentMovieData;
                state.currentBookData = initialState.currentBookData;
            })
            .addCase(deleteDiaryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(searchMembersAsync.pending, (state) => {
                state.isSearching = true;
                state.searchError = null;
            })
            .addCase(searchMembersAsync.fulfilled, (state, action) => {
                state.isSearching = false;
                state.friendSearchResults = action.payload.data;
            })
            .addCase(searchMembersAsync.rejected, (state, action) => {
                state.isSearching = false;
                state.searchError = action.payload as string;
                state.friendSearchResults = [];
            });
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
    addTag,
    removeTag,
    clearSearchResults,
    clearAllTags,
} = diarySlice.actions;

export default diarySlice.reducer;