/**
 * 알림 타입 정의 (백엔드 명세 기반)
 */
export type NotificationType = 'ALARM' | 'FRIEND_REQUEST' | 'DIARY_TAG' | 'MEMO_TAG' | 'SCHEDULE_TAG';

/**
 * 알림 관련 데이터 (옵셔널)
 */
export interface RelatedData {
    scheduleId?: number;
    diaryId?: number;
    memoId?: number;
    friendRequestId?: number; // 친구 요청 관련 ID
    tagId?: number; // 다이어리/메모/일정 태그 관련 ID
}

/**
 * 백엔드에서 받는 기본 알림 구조
 */
export interface UnifiedAlarm {
    id: number;
    memberId: number;
    type: NotificationType;
    message: string;
    createdAt: string; // ISO 8601
    readAt: string | null; // 읽은 시간, null이면 안 읽음
    relatedData?: RelatedData;
}

// --------------------------- API 요청/응답 타입 ---------------------------

export interface NotificationData {
    data: UnifiedAlarm[]; // 👈 JSON에서 알림 목록이 있는 실제 배열 키
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        unreadCount: number; // 👈 읽지 않은 개수
        size: number;
    };
}


/**
 * 1. 알림 목록 조회 응답: GET /notifications
 */
export interface FetchNotificationsResponse {
    status: number;
    message: string;
    body: NotificationResponseBody; // ✅ 이 필드를 통해 접근해야 합니다.
}


// 2. HTTP 응답 body 구조 (최상위 body 필드)
export interface NotificationResponseBody {
    data: NotificationData; // 위에 정의된 NotificationData 객체
}
/**
 * 2. 개별 알림 읽음 처리 응답: PATCH /notifications/{notificationId}/read
 * (UnifiedAlarm에서 readAt만 업데이트된 정보를 반환할 것으로 가정)
 */
export interface MarkAsReadResponse {
    id: number;
    readAt: string; // 읽은 시간 (ISO 8601)
}

/**
 * 3. 전체 알림 읽음 처리 응답: PATCH /notifications/read-all
 * (전체 읽음 처리 완료 시간 반환으로 가정)
 */
export interface MarkAllAsReadResponse {
    updatedAt: string; // 전체 읽음 처리 완료 시간 (ISO 8601)
}

/**
 * 4. 다이어리 태그 응답 요청: PATCH /notifications/tag-response
 */
export interface TagResponseRequest {
    notificationId: number;
    tagId: number;
    isAccepted: boolean; // 수락(true) 또는 거절(false)
}

/**
 * 4. 다이어리 태그 응답 처리 응답
 */
export interface TagResponseResponse {
    notificationId: number;
    updatedAt: string; // 처리된 시간 (읽음 처리됨)
    message: string;
}