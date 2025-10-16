import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
// 기존 UnifiedAlarm을 새 타입 파일에서 import 합니다.
import { 
    UnifiedAlarm, 
    MarkAsReadResponse, 
    MarkAllAsReadResponse, 
    TagResponseRequest, 
    TagResponseResponse 
} from '../../types/Notification.types' 
import { API } from '../../services/api' // API 함수 import
import { RootState } from '../../store'

// ExtendedUnifiedAlarm 타입 수정 (message는 UnifiedAlarm에 포함되므로 relatedData만 확장해도 무방)
// 그러나 기존 코드와 일관성을 위해 message 필드는 유지
export interface ExtendedUnifiedAlarm extends UnifiedAlarm {
    // message는 UnifiedAlarm에 있지만, 기존 코드와의 호환성을 위해 유지
    // relatedData는 이미 UnifiedAlarm의 RelatedData 인터페이스로 통합됨
}

interface NotificationState {
    // notifications 타입 변경: ExtendedUnifiedAlarm[] -> UnifiedAlarm[] (새 타입 파일 사용)
    notifications: UnifiedAlarm[]; 
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    isPopoverOpen: boolean;
}

const initialState: NotificationState = {
    notifications: [], // 🚨 더미 데이터 삭제
    unreadCount: 0,
    isLoading: false,
    error: null,
    isPopoverOpen: false,
};


// 1. 알림 목록 조회 Thunk
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.fetchNotifications();
            return response;
        } catch (error) {
            // ✅ 에러 객체 자체를 rejectWithValue로 반환하여 rejected 로직이 모든 정보를 받도록 합니다.
            return rejectWithValue(error); 
        }
    }
);

// 2. 개별 읽음 처리 Thunk
export const markAsRead = createAsyncThunk<MarkAsReadResponse, number, { state: RootState }>(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await API.markAsRead(notificationId);
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// 3. 전체 읽음 처리 Thunk
export const markAllAsRead = createAsyncThunk<MarkAllAsReadResponse, void, { state: RootState }>(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.markAllAsRead();
            return response; // { updatedAt: string } 반환
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// 4. 태그 응답 처리 Thunk
export const handleTagResponse = createAsyncThunk<TagResponseResponse, TagResponseRequest, { state: RootState }>(
    'notifications/handleTagResponse',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await API.handleTagResponse(payload);
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);


const notiSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setPopoverOpen: (state, action: PayloadAction<boolean>) => {
            state.isPopoverOpen = action.payload;
        },
        // ⭐ DB에 새 데이터가 생겨 웹소켓으로 알림이 오면 실행됩니다.
        addNewNotification: (state, action: PayloadAction<UnifiedAlarm>) => {
            state.notifications.unshift(action.payload);
            
            // 🚨 핵심: 이 조건이 False가 되면 unreadCount는 증가하지 않습니다.
            if (!action.payload.readAt) {
                state.unreadCount += 1; 
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // 1. 알림 목록 조회 처리
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => { // ✅ 이 로직만 남깁니다.
                state.isLoading = false;

                // API 응답 구조에 맞게 'body.data'에 접근합니다.
                const apiBody = action.payload.body; 

                const apiData = apiBody?.data; 

                if (apiData && Array.isArray(apiData.data)) {
                state.notifications = apiData.data; 
                state.unreadCount = apiData.pagination?.unreadCount ?? 0;

                } else {
                console.error("fetchNotifications: 예상치 못한 API 응답 구조. body.data.data를 찾을 수 없습니다.", action.payload);
                state.notifications = [];
                state.unreadCount = 0;
                }
            })
            
            // 2. 개별 읽음 처리 (기존 로직 유지)
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload.id);
                if (notification && !notification.readAt) { // 아직 읽지 않은 알림이라면
                    notification.readAt = action.payload.readAt;
                    state.unreadCount = Math.max(0, state.unreadCount - 1); // unreadCount 감소
                }
            })
            
            // 3. 전체 읽음 처리 (기존 로직 수정)
            .addCase(markAllAsRead.fulfilled, (state, action) => {
                state.notifications.forEach(notification => {
                    if (!notification.readAt) { // 아직 읽지 않은 알림만 업데이트
                        notification.readAt = action.payload.updatedAt;
                    }
                });
                state.unreadCount = 0;
            })
            
            // 4. 태그 응답 처리 (기존 handleDiaryTagResponse를 handleTagResponse로 이름 변경 및 로직 통합)
            .addCase(handleTagResponse.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload.notificationId);
                if (notification && !notification.readAt) {
                    // 응답 처리 후 해당 알림을 읽음 처리
                    notification.readAt = action.payload.updatedAt;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
    },
});

export const { setPopoverOpen, addNewNotification } = notiSlice.actions;

export default notiSlice.reducer;