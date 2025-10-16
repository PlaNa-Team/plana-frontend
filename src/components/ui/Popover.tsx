import React, { useEffect, useCallback } from "react"
import * as Popover from '@radix-ui/react-popover'
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { ko } from 'date-fns/locale'
import { RootState } from "../../store";
import {
    fetchNotifications, 
    markAllAsRead,      
    handleTagResponse,  
    markAsRead,         
    setPopoverOpen,
} from '../../store/slices/notiSlice'
import { UnifiedAlarm } from "../../types/Notification.types"; 
import { BellIcon } from '../../assets/icons'; 


interface PopoverProps {
    children: React.ReactNode;
}

// 태그 응답 처리 핸들러의 시그니처
type TagResponseHandler = (notificationId: number, tagId: number, isAccepted: boolean) => void;

// 🔔 알림 항목을 별도의 함수 컴포넌트(대문자로 시작)로 변경하여 Hook 사용 규칙을 준수합니다.
const NotificationItem: React.FC<{ notification: UnifiedAlarm, handleTagResponseClick: TagResponseHandler }> = ({ notification, handleTagResponseClick }) => {
    
    // ✅ useDispatch를 함수 컴포넌트 최상위에서 호출합니다. (규칙 준수)
    const dispatch = useDispatch();
    
    const handleNotificationClick = () => {
        if (!notification.readAt) {
            dispatch(markAsRead(notification.id) as any);
        }
        // TODO: 알림 타입에 따라 적절한 페이지로 이동하는 로직 추가
    };
    
    const isUnread = !notification.readAt;
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ko });
    
    const isTagNotification = notification.type === 'DIARY_TAG' || notification.type === 'SCHEDULE_TAG' || notification.type === 'MEMO_TAG';

    return (
        <div 
            key={notification.id} 
            className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}
            onClick={handleNotificationClick} 
        >
            <div className="notification-item__icon">
                <BellIcon fill={isUnread ? "var(--color-primary)" : "var(--color-text-secondary)"} />
            </div>
            <div className="notification-item__body">
                <div className="notification-item__message">{notification.message}</div>
                <div className="notification-item__time">{timeAgo}</div>
                
                {isTagNotification && isUnread && notification.relatedData?.tagId && (
                    <div className="notification-item__actions">
                        <button 
                            className="btn btn--accept" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                handleTagResponseClick(notification.id, notification.relatedData!.tagId!, true); 
                            }}
                        >
                            수락
                        </button>
                        <button 
                            className="btn btn--reject"
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleTagResponseClick(notification.id, notification.relatedData!.tagId!, false); 
                            }}
                        >
                            거절
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const CustomPopover: React.FC<PopoverProps> = ({ children }) => {
    const dispatch = useDispatch();

     const {
        notifications = [], 
        unreadCount = 0,    
        isLoading = false,
        isPopoverOpen = false
    // 🚨 state.notifications가 null일 때를 대비
    } = useSelector((state: RootState) => state.notifications) || {}; 


    // Thunk 디스패치를 위한 타입 단언을 제거하거나 any로 처리합니다. (useCallback을 사용하여 최적화)
    const dispatchAsync = useCallback((action: any) => dispatch(action), [dispatch]);


    // 컴포넌트 마운트 시 알림 목록 가져오기
    useEffect(() => {
         // 팝오버가 열릴 때 (isPopoverOpen이 true로 바뀔 때)만 알림 목록을 가져옵니다.
    if (isPopoverOpen) { 
        dispatch(fetchNotifications() as any);
    }
    }, [dispatch, isPopoverOpen]); // ✨ 의존성 배열에 isPopoverOpen을 추가

    // 태그 응답 처리 (수락/거절) 핸들러
    const handleTagResponseClick = useCallback((notificationId: number, tagId: number, isAccepted: boolean) => {
        dispatchAsync(handleTagResponse({ notificationId, tagId, isAccepted }));
    }, [dispatchAsync]);

    const handleOpenChange = (open: boolean) => {
        dispatch(setPopoverOpen(open) as any); // Popover 상태 업데이트

        // 팝오버를 닫을 때 모든 알림 읽음 처리
        if (!open && unreadCount > 0) {
            dispatchAsync(markAllAsRead() as any); 
        }
    };

    return (
        <Popover.Root open={isPopoverOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>
                {children} 
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="notification-popover" 
                    side="bottom"
                    align="end"
                >
                    <div className="notification-popover__header">
                        <h3 className="notification-popover__title">알림</h3>
                        
                        {/* '모두 읽음' 버튼 */}
                        { unreadCount > 0 && (
                            <button 
                                className="notification-popover__read-all"
                                // 타입 오류 방지를 위해 dispatchAsync 사용
                                onClick={() => dispatchAsync(markAllAsRead())} 
                            >
                                모두 읽음
                            </button>
                        )}
                        {/* 읽지 않은 알림 카운트 */}
                        { unreadCount > 0 && (
                            <span className="notification-popover__unread-count">
                                { unreadCount }개의 새 알림
                            </span>
                        )}
                    </div>

                    <div className="notification-popover__content">
                        { isLoading ? (
                        <div className="notification-popover__loading">
                            알림을 불러오는 중 ...
                        </div>
                        ) :notifications.length === 0 ? (
                            <div className="notification-popover__empty">
                                새로운 알림이 없습니다.
                            </div>
                        ) : (
                            <div className="notification-popover__list">
                                {/* ✅ 수정: NotificationItem 컴포넌트를 직접 사용하도록 변경 */}
                                { notifications.map(n => (
                                    
                                    <NotificationItem 
                                        key={n.id} 
                                        notification={n} 
                                        handleTagResponseClick={handleTagResponseClick} 
                                    />
                                    
                                ))}
                       
                            </div>
                        )}
                    </div>

                    <Popover.Arrow className="notification-popover__arrow"/>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
};

export default CustomPopover;