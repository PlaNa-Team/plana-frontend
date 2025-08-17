import React, { useEffect } from "react"
import * as Popover from '@radix-ui/react-popover'
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { ko } from 'date-fns/locale'
import { RootState } from "../../store";
import {
    fetchNotifications,
    markAllAsRead,
    handleDiaryTagResponse,
    setPopoverOpen,
    ExtendedUnifiedAlarm
} from '../../store/slices/notiSlice'

interface PopoverProps {
    children: React.ReactNode;
}

const CustomPopover: React.FC<PopoverProps> = ({ children }) => {
    const dispatch = useDispatch();

    const {
        notifications,
        unreadCount,
        isLoading,
        isPopoverOpen
    } = useSelector((state: RootState) => state.notifications);

    useEffect(() => {
        // 컴포넌트 마운트 시 알림 목록 가져오기
        dispatch(fetchNotifications() as any);
    }, [dispatch]);

    const handleOpenChange = (open: boolean) => {
        dispatch(setPopoverOpen(open) as any);

        // 팝오버를 닫을 떄 모든 알림 읽음 처리
        if (!open && unreadCount > 0) {
            dispatch(markAllAsRead() as any);
        }
    };

    const handleTagResponse = (notificationId: number, tagStatus: '수락'|'거절') => {
        dispatch(handleDiaryTagResponse({ notificationId, tagStatus }) as any);
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: ko
            });
        } catch {
            return '시간 정보 없음';
        }
    };

    const renderNotificationItem = (notification: ExtendedUnifiedAlarm) => {
        return (
            <div key={notification.id} className="notification-item">
                <div className="notification-item__header">
                    {!notification.isRead && (
                        <div className="notification-item__unread-indicator"/>
                    )}
                    <div className="notification-item__content">
                        <p className="notification-item__message">
                            { notification.message }
                        </p>
                        <span className="notification-item__time">
                            { formatTime(notification.time) }
                        </span>
                    </div>
                </div>

                { notification.type === 'TAG' && (
                    <div className="notification-item__actions">
                        <button
                            className="notification-item__button notification-item__button--accept"
                            onClick={() => handleTagResponse(notification.id, '수락')}
                        >
                            수락
                        </button>
                        <button
                            className="notification-item__button notification-item__button--reject"
                            onClick={() => handleTagResponse(notification.id, '거절')}
                        >
                            거절
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Popover.Root open={ isPopoverOpen } onOpenChange={ handleOpenChange }>
            <Popover.Trigger asChild>
                { children }
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content 
                    className="notification-popover" 
                    side="bottom"
                    align="end"
                >
                    <div className="notification-popover__header">
                        <h3 className="notification-popover__title">알림</h3>
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
                                { notifications.map(renderNotificationItem) }
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