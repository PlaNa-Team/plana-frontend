import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { UnifiedAlarm } from '../../types'

export interface ExtendedUnifiedAlarm extends UnifiedAlarm {
    message: string;
    relatedData?: {
        scheduleId?: number;
        diaryId?: number;
        alarmId?: number;
    };
}

interface NotificationState {
    notifications: ExtendedUnifiedAlarm[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    isPopoverOpen: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    isPopoverOpen: false,
};

// 더미 데이터
const tempNotifications: ExtendedUnifiedAlarm[] = [
    {
        id: 1,
        alarmId: 123,
        memberId: 1,
        type: 'ALARM',
        message: "10분 후 프로젝트 회의",
        time: '2025-08-02T14:50:00',
        isRead: false,
        createdAt: '2025-08-02T14:50:00',
        relatedData: {
            scheduleId: 123
        }
    },
    {
        id: 2,
        tagId: 25,
        memberId: 1,
        type: 'TAG',
        message: "민혁님이 (영화)\"좀비딸\"에 회원님을 태그하였습니다.",
        time: '2025-08-02T12:30:00',
        isRead: false,
        createdAt: '2025-08-02T12:30:00',
        relatedData: {
            diaryId: 23
        }
    },
    {
        id: 3,
        alarmId: 124,
        memberId: 1,
        type: 'ALARM',
        message: "내일 AM 10:00 치과 예약",
        time: '2025-08-01T20:00:00',
        isRead: true,
        readAt: '2025-08-01T20:30:00',
        createdAt: '2025-08-01T20:00:00',
        relatedData: {
            scheduleId: 124
        }
    },
    {
        id: 4,
        tagId: 26,
        memberId: 1,
        type: 'TAG',
        message: "민영님이 (영화)\"좀비딸\"을 수정하였습니다.",
        time: '2025-08-01T15:20:00',
        isRead: true,
        readAt: '2025-08-01T16:00:00',
        createdAt: '2025-08-01T15:20:00',
        relatedData: {
            diaryId: 15
        }
    }
];

// 비동기 액션들
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async () => {
      // 목 데이터 반환 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      return tempNotifications;
    }
  );

  export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: number) => {
      // 목 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        id: notificationId,
        isRead: true,
        readAt: new Date().toISOString()
      };
    }
  );

  export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async () => {
      // 목 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 300));
      return new Date().toISOString();
    }
  );
  
  export const handleDiaryTagResponse = createAsyncThunk(
    'notifications/handleDiaryTagResponse',
    async ({ notificationId, tagStatus }: { notificationId: number; tagStatus: '수락' | '거절' }) => {
      // 목 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        notificationId,
        tagStatus,
        updatedAt: new Date().toISOString()
      };
    }
  );

  const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
      setPopoverOpen: (state, action: PayloadAction<boolean>) => {
        state.isPopoverOpen = action.payload;
      },
      clearError: (state) => {
        state.error = null;
      },
        //실시간 알림을 상태에 반영하는 리듀서
      addNewNotification: (state, action: PayloadAction<ExtendedUnifiedAlarm>) => {
        // 알림 목록의 가장 앞에 새 알림 추가
        state.notifications.unshift(action.payload); 
        // 읽지 않은 알림 카운트 증가 (새 알림은 기본적으로 isRead: false로 들어온다고 가정)
        if (!action.payload.isRead) {
            state.unreadCount += 1;
        }
      }
    },
    extraReducers: (builder) => {
      builder
        // 알림 목록 조회
        .addCase(fetchNotifications.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchNotifications.fulfilled, (state, action) => {
          state.isLoading = false;
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter(n => !n.isRead).length;
        })
        .addCase(fetchNotifications.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || '알림을 불러오는데 실패했습니다.';
        })
        
        // 개별 읽음 처리
        .addCase(markAsRead.fulfilled, (state, action) => {
          const notification = state.notifications.find(n => n.id === action.payload.id);
          if (notification) {
            notification.isRead = true;
            notification.readAt = action.payload.readAt;
            state.unreadCount = state.notifications.filter(n => !n.isRead).length;
          }
        })
        
        // 전체 읽음 처리
        .addCase(markAllAsRead.fulfilled, (state, action) => {
          state.notifications.forEach(notification => {
            if (!notification.isRead) {
              notification.isRead = true;
              notification.readAt = action.payload;
            }
          });
          state.unreadCount = 0;
        })
        
        // 다이어리 태그 응답 처리
        .addCase(handleDiaryTagResponse.fulfilled, (state, action) => {
          const notification = state.notifications.find(n => n.id === action.payload.notificationId);
          if (notification) {
            // 수락/거절 처리 후 해당 알림을 읽음 처리
            notification.isRead = true;
            notification.readAt = action.payload.updatedAt;
            state.unreadCount = state.notifications.filter(n => !n.isRead).length;
          }
        });
    },
  });
  
  export const { setPopoverOpen, clearError, addNewNotification  } = notificationSlice.actions;
  export default notificationSlice.reducer;