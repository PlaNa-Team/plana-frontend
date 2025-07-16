import React, { useState, useEffect } from 'react';

interface DayEvent {
  id: string;
  title: string;
  time: string;
  category: 'meeting' | 'personal' | 'work';
  description?: string;
}

interface CalendarDayClickModalProps {
  // 외부에서 날짜 클릭 이벤트를 전달받기 위한 prop
  onDateClick?: (dateStr: string) => void;
}

const CalendarDayClickModal: React.FC<CalendarDayClickModalProps> = ({
  onDateClick
}) => {
  // 🔄 내부에서 모든 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 🎯 전역 날짜 클릭 이벤트 리스너 등록
  useEffect(() => {
    const handleDateClickEvent = (event: CustomEvent) => {
      const dateStr = event.detail.dateStr;
      setSelectedDate(dateStr);
      setIsOpen(true);
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('calendar-date-click' as any, handleDateClickEvent);

    return () => {
      window.removeEventListener('calendar-date-click' as any, handleDateClickEvent);
    };
  }, []);

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

  // 해당 날짜의 일정 데이터 (실제로는 API에서 가져올 예정)
  const getDayEvents = (): DayEvent[] => {
    // 더미 데이터 - 나중에 실제 API 호출로 교체
    const sampleEvents: DayEvent[] = [
      {
        id: '1',
        title: '프로젝트 회의',
        time: '10:00 - 11:00',
        category: 'work',
        description: '새 기능 개발 논의'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      },
      {
        id: '2',
        title: '점심 약속',
        time: '12:30 - 14:00',
        category: 'personal',
        description: '친구와 만남'
      }
    ];

    // 실제로는 selectedDate에 해당하는 일정만 필터링
    return selectedDate === '2025-09-04' ? sampleEvents : [];
  };

  const dayEvents = getDayEvents();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedDate('');
  };

  const handleAddEvent = () => {
    // 나중에 일정 추가 기능 구현
    console.log('일정 추가 버튼 클릭');
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
          {dayEvents.length === 0 ? (
            <div className="no-events">
              <p>등록된 일정이 없습니다.</p>
              <span className="add-event-hint">+ 버튼을 눌러 일정을 추가해보세요</span>
            </div>
          ) : (
            <div className="events-list">
              {dayEvents.map((event) => (
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