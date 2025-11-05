import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { diaryApi } from '../../services/api'; // ✅ 수정: 새 api.ts 사용
import {
    MonthlyDiaryItem,
    DiaryDetail,
    CreateDiaryRequest,
    DailyContent,
    MovieContent,
    BookContent,
    TempImageResponse,
    DiaryCreateResponse,
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
    currentViewMonthAndYear: { year: number; month: number };
    friendSearchResults: FriendItem[];
    selectedTags: DiaryTagRequest[];
    isSearching: boolean;
    searchError: string | null;

    // 🔐 락 관리
    lockToken: string | null;
    lockExpiresAt: string | null;
}

const initialState: DiaryState = {
    currentMomentData: {
        title: '',
        location: '',
        memo: '',
        imageUrl: '',
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
        imageUrl: '',
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
        imageUrl: '',
    },
    selectedDate: null,
    monthlyDiaries: [],
    currentDiaryDetail: undefined,
    isLoading: false,
    isUploading: false,
    error: null,
    showSuccessToast: false,
    currentViewMonthAndYear: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    },
    friendSearchResults: [],
    selectedTags: [],
    isSearching: false,
    searchError: null,

    lockToken: null,
    lockExpiresAt: null,
};

// 📌 1. 월간 다이어리 조회
export const getMonthlyDiariesAsync = createAsyncThunk<
    MonthlyDiaryItem[],
    { year: number; month: number },
    { rejectValue: string }
>('diary/getMonthlyDiaries', async ({ year, month }, { rejectWithValue }) => {
    try {
        const data = await diaryApi.getMonthlyDiaries(year, month);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue('월간 다이어리 조회 실패');
        }
        return rejectWithValue('네트워크 오류');
    }
});

// 📌 2. 다이어리 상세 조회 + 락 토큰 획득
export const getDiaryDetailWithLockAsync = createAsyncThunk<
    { diary: DiaryDetail; lockToken?: string; expiresAt?: string },
    string,
    { rejectValue: string }
>('diary/getDiaryDetailWithLock', async (date, { rejectWithValue }) => {
    try {
        const { diary, lock } = await diaryApi.getDiaryDetailWithLock(date);
        return {
            diary,
            lockToken: lock?.token ?? null,
            expiresAt: lock?.expiresAt ?? null,
        };
    } catch (error) {
        return rejectWithValue('다이어리 상세 조회 실패');
    }
});

// 📌 3. 다이어리 등록
export const createDiaryAsync = createAsyncThunk<
    DiaryCreateResponse,
    { diaryData: CreateDiaryRequest },
    { rejectValue: string; state: RootState }
>('diary/createDiary', async ({ diaryData }, { dispatch, rejectWithValue, getState }) => {
    try {
        const response = await diaryApi.createDiary(diaryData);
        const { year, month } = getState().diary.currentViewMonthAndYear;
        await dispatch(getMonthlyDiariesAsync({ year, month }));
        return response;
    } catch {
        return rejectWithValue('다이어리 등록 실패');
    }
});

// 📌 4. 다이어리 수정
export const updateDiaryAsync = createAsyncThunk<
    DiaryDetail,
    { id: number; payload: any },
    { rejectValue: string; state: RootState }
>('diary/updateDiary', async ({ id, payload }, { getState, rejectWithValue }) => {
    const { lockToken } = getState().diary;
    if (!lockToken) return rejectWithValue('락 토큰이 없습니다.');
    try {
        const updated = await diaryApi.updateDiary(id, payload, lockToken);
        return updated;
    } catch {
        return rejectWithValue('다이어리 수정 실패');
    }
});

// 📌 5. 다이어리 삭제
export const deleteDiaryAsync = createAsyncThunk<
    void,
    number,
    { rejectValue: string; state: RootState }
>('diary/deleteDiary', async (id, { dispatch, rejectWithValue, getState }) => {
    try {
        await diaryApi.deleteDiary(id);
        const { year, month } = getState().diary.currentViewMonthAndYear;
        await dispatch(getMonthlyDiariesAsync({ year, month }));
    } catch {
        return rejectWithValue('다이어리 삭제 실패');
    }
});

// 📌 6. 락 해제
export const releaseDiaryLockAsync = createAsyncThunk<
    void,
    number,
    { state: RootState; rejectValue: string }
>('diary/releaseLock', async (diaryId, { getState, rejectWithValue }) => {
    try {
        const { lockToken } = getState().diary;
        if (lockToken) await diaryApi.releaseDiaryLock(diaryId, lockToken);
    } catch {
        return rejectWithValue('락 해제 실패');
    }
});

// 📌 7. 락 갱신
export const renewDiaryLockAsync = createAsyncThunk<
    { expiresAt: string },
    number,
    { state: RootState; rejectValue: string }
>('diary/renewLock', async (diaryId, { getState, rejectWithValue }) => {
    try {
        const { lockToken } = getState().diary;
        if (!lockToken) return rejectWithValue('락 토큰 없음');
        const res = await diaryApi.renewDiaryLock(diaryId, lockToken);
        return { expiresAt: res.expiresAt };
    } catch {
        return rejectWithValue('락 갱신 실패');
    }
});

// 📌 8. 친구 검색
export const searchMembersAsync = createAsyncThunk<
    FriendSearchResponse,
    string,
    { rejectValue: string }
>(
    'diary/searchMembers',
    async (keyword, { rejectWithValue }) => {
        try {
            const response = await diaryApi.searchMembers(keyword);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// 📌 9. 이미지 업로드
export const uploadTempImageAsync = createAsyncThunk<
    TempImageResponse,
    { file: File; diaryType: 'DAILY' | 'MOVIE' | 'BOOK' },
    { rejectValue: string }
>('diary/uploadTempImage', async ({ file, diaryType }, { rejectWithValue }) => {
    try {
        const response = await diaryApi.uploadTempImage(file);
        return response;
    } catch {
        return rejectWithValue('이미지 업로드 실패');
    }
});

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
        addTag: (state, action: PayloadAction<DiaryTagRequest>) => {
            const exists = state.selectedTags.find(tag => tag.tagText === action.payload.tagText);
            if (!exists) state.selectedTags.push(action.payload);
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
        setCurrentViewMonthAndYear: (state, action: PayloadAction<{ year: number; month: number }>) => {
            state.currentViewMonthAndYear = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        hideSuccessToast: (state) => {
            state.showSuccessToast = false;
        },
        clearLockInfo: (state) => {
            state.lockToken = null;
            state.lockExpiresAt = null;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getMonthlyDiariesAsync.fulfilled, (state, action) => {
            state.monthlyDiaries = action.payload;
            state.isLoading = false;
        })
        .addCase(getDiaryDetailWithLockAsync.fulfilled, (state, action) => {
            state.currentDiaryDetail = action.payload.diary;
            state.lockToken = action.payload.lockToken ?? null;
            state.lockExpiresAt = action.payload.expiresAt ?? null;
        })
        .addCase(renewDiaryLockAsync.fulfilled, (state, action) => {
            state.lockExpiresAt = action.payload.expiresAt;
        })
        .addCase(uploadTempImageAsync.fulfilled, (state, action) => {
            const tempUrl = action.payload.data.tempUrl;
            const { diaryType } = action.meta.arg;
            switch (diaryType) {
                case 'DAILY':
                    state.currentMomentData.imageUrl = tempUrl;
                    break;
                case 'MOVIE':
                    state.currentMovieData.imageUrl = tempUrl;
                    break;
                case 'BOOK':
                    state.currentBookData.imageUrl = tempUrl;
                    break;
            }
        });
    },
});

export const {
    setSelectedDate,
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    addTag,
    removeTag,
    clearSearchResults,
    clearAllTags,
    setCurrentViewMonthAndYear,
    clearError,
    hideSuccessToast,
    clearLockInfo,
} = diarySlice.actions;

export default diarySlice.reducer;