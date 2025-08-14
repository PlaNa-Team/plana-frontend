import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  selectEvents,
  fetchMonthlySchedules
} from '../../store/slices/calendarSlice';

interface DayEvent {
  id: string;
  title: string;
  time: string;
  category: 'meeting' | 'personal' | 'work';
  description?: string;
  color?: string;
}

interface CalendarDayClickModalProps {
  // 외부에서 날짜 클릭 이벤트를 전달받기 위한 prop
  onDateClick?: (dateStr: string) => void;
  // 일정 추가 모달 열기 콜백 추가
  onOpenAddModal?: () => void;
}

const CalendarDayClickModal: React.FC<CalendarDayClickModalProps> = ({
  onDateClick,
  onOpenAddModal
}) => {

  const dispatch = useAppDispatch();

  // Redux에서 월간 일정 데이터 가져오기
  const monthlyEvents = useAppSelector(selectEvents);

  // 🔄 내부에서 모든 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 선택된 날짜의 일정만 필터링
  const dailyEvents: DayEvent[] = React.useMemo(() => {
    if (!selectedDate || !monthlyEvents.length) return [];
    // 선택된 날짜와 같은 일정들만 필터링
    const filteredEvents = monthlyEvents.filter((event: any) => {
      const eventDate = event.start.split('T')[0]; // 'YYYY-MM-DD' 부분만 추출
      return eventDate === selectedDate;
    });

    // CalendarEvent를 DayEvent 형식으로 변환
    return filteredEvents.map((event: any) => {
      // 시간 포맷팅
      const formatTime = (start: string, end?: string, allDay?: boolean): string => {
        if (allDay) return '종일';
        
        if (!end) {
          return new Date(start).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }

        const startTime = new Date(start).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const endTime = new Date(end).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        return `${startTime} - ${endTime}`;
      };

      // 카테고리 매핑
      const mapCategory = (categoryName?: string): 'meeting' | 'personal' | 'work' => {
        if (!categoryName) return 'work';
        
        switch (categoryName.toLowerCase()) {
          case '회의':
          case 'meeting':
            return 'meeting';
          case '개인':
          case 'personal':
            return 'personal';
          default:
            return 'work';
        }
      };

      return {
        id: event.id,
        title: event.title,
        time: formatTime(event.start, event.end, event.allDay),
        category: mapCategory(event.extendedProps?.categoryName),
        description: '',
        color: event.backgroundColor
      };
    });
  }, [selectedDate, monthlyEvents]);

  // 날짜 클릭 이벤트 리스너
  useEffect(() => {
    const handleDateClickEvent = (event: CustomEvent) => {
      const dateStr = event.detail.dateStr;
      setSelectedDate(dateStr);
      setIsOpen(true);

      // 해당 월의 데이터가 없으면 새로 로드
      const targetDate = new Date(dateStr);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      
      // 월간 일정이 비어있거나 다른 월이면 새로 로드
      if (monthlyEvents.length === 0) {
        dispatch(fetchMonthlySchedules({ year, month }));
      }
    };

    window.addEventListener('calendar-date-click' as any, handleDateClickEvent);

    return () => {
      window.removeEventListener('calendar-date-click' as any, handleDateClickEvent);
    };
  }, [dispatch, monthlyEvents.length]);

  // 선택된 날짜를 한국어 형태로 포맷팅
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${month}월 ${day}일 ${weekday}요일`;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedDate('');
  };

  // + 버튼 클릭 핸들러 - 일정 추가 모달 열기
  const handleAddEvent = () => {
    closeModal(); // 현재 모달 닫기
    if (onOpenAddModal) {
      onOpenAddModal(); // 일정 추가 모달 열기
    }
  };

  const handleRetry = () => {
    const targetDate = new Date(selectedDate);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    dispatch(fetchMonthlySchedules({ year, month }));
  };

  if (!isOpen) return null;

  return (
    <div className="day-modal-overlay" onClick={handleOverlayClick}>
      <div className="day-modal-container">
        {/* 모달 헤더 */}
        <div className="day-modal-header">
          <h2 className="day-modal-title">{formatDate(selectedDate)}</h2>
          <button className="add-event-button" onClick={handleAddEvent}>
            +
          </button>
        </div>

        {/* 일정 목록 */}
        <div className="day-events-section">
          {dailyEvents.length === 0 ? (
            <div className="no-events">
              <p>등록된 일정이 없습니다.</p>
              <span className="add-event-hint">+ 버튼을 눌러 일정을 추가해보세요</span>
            </div>
          ) : (
            <div className="events-list">
              {dailyEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className={`event-category-indicator ${event.category}`} />
                  <div className="event-content">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>  
                    </div>
                     <span className="event-time">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarDayClickModal;