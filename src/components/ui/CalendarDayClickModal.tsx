import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  selectEvents,
  fetchMonthlySchedules,
  deleteSchedule,

} from '../../store/slices/calendarSlice';
import { DayEvent } from '../../types/calendar.types';
import { calendarAPI } from '../../services/api';
import { ScheduleFormData } from '../../types/calendar.types';
import { transformDetailToFormData } from '../../services/api';
import { TrashBinIcon } from '../../assets/icons';
import { selectCurrentYear, selectCurrentMonth } from '../../store/slices/calendarSlice'; // 🔑 추가



interface CalendarDayClickModalProps {
  // 외부에서 날짜 클릭 이벤트를 전달받기 위한 prop
  onDateClick?: (dateStr: string) => void;
  onOpenAddModal?: (selectedDate: string) => void; // 🔑 선택된 날짜 전달
  onOpenEditModal?: (scheduleData: ScheduleFormData) => void;   // 🔑 일정 데이터 전달
  // 일정 추가 모달 열기 콜백 추가
}

const CalendarDayClickModal: React.FC<CalendarDayClickModalProps> = ({
  onDateClick,
  onOpenEditModal,
  onOpenAddModal
}) => {

  const dispatch = useAppDispatch();
  
  // Redux에서 월간 일정 데이터 가져오기
  const monthlyEvents = useAppSelector(selectEvents);

  const currentYear = useAppSelector(selectCurrentYear); // 🔑 현재 년도
  const currentMonth = useAppSelector(selectCurrentMonth); // 🔑 현재 월
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 🔄 내부에서 모든 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 선택된 날짜의 일정만 필터링
  const dailyEvents: DayEvent[] = React.useMemo(() => {
    if (!selectedDate || !monthlyEvents.length) {
      return [];
    }
    const filteredEvents = monthlyEvents.filter((event:any) => {
      const eventStartDate = event.start.split('T')[0]; // 시작일
      
      // 종일 이벤트의 경우 원본 종료일을 사용 (FullCalendar +1일 보정 제거)
      let eventEndDate = event.end ? event.end.split('T')[0] : eventStartDate;
      
      if (event.allDay && event.end) {
        // 종일 이벤트는 FullCalendar에서 +1일 했으므로 -1일 해서 원본 복원
        const endDate = new Date(event.end);
        endDate.setDate(endDate.getDate() - 1);
        eventEndDate = endDate.toISOString().split('T')[0];
      }

      // 선택된 날짜가 일정 기간 내에 포함되는지 확인
      return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
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
      onOpenAddModal(selectedDate); // 선택된 날짜 전달
    }
  };

  // 🚀 **핵심 변경사항: 상세 조회 API 호출 추가**
  const handleEventClick = async (event: DayEvent) => {
    if (!onOpenEditModal) return;
    
    try {
      console.log('🔍 일정 상세 조회 시작 - ID:', event.id);
      
      // 🆕 일정 상세 조회 API 호출
      const detailResponse = await calendarAPI.getScheduleDetail(event.id);
      
      // 🆕 API 응답을 ScheduleFormData로 변환
      const scheduleFormData = transformDetailToFormData(detailResponse.data);
      
      console.log('✅ 상세 데이터 로드 완료:', scheduleFormData);
      
      // 모달 닫고 수정 모달 열기
      closeModal();
      onOpenEditModal(scheduleFormData);
      
    } catch (error) {
      console.error('💥 일정 상세 조회 실패:', error);
      
      // ⚠️ 실패 시 기본 데이터라도 전달 (기존 방식)
      const fallbackData: ScheduleFormData = {
        id: event.id,
        title: event.title,
        startDate: selectedDate,
        startTime: event.time.includes('종일') ? '09:00' : event.time.split(' - ')[0] || '09:00',
        endDate: selectedDate,
        endTime: event.time.includes('종일') ? '18:00' : event.time.split(' - ')[1] || '18:00',
        isAllDay: event.time.includes('종일'),
        color: event.color || 'blue',
        category: event.category,
        description: event.description || '',
        location: '',
        memo: '',
        repeatValue: '',
        alarmValue: '',
        tags: []
      };
      
      closeModal();
      onOpenEditModal(fallbackData);
    }
  };

  const handleDeleteClick = (eventId: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); // 🛑 일정 클릭 방지
    setDeleteTargetId(eventId); // 🔥 삭제할 이벤트 설정
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    dispatch(deleteSchedule({ eventId: deleteTargetId, year: currentYear, month: currentMonth }));
    setDeleteTargetId(null); // 모달 닫기
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
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
                <div key={event.id} className="event-item" onClick={() => handleEventClick(event)}>
                  <div className={`event-category-indicator event-color-${event.color}`} />
                  <div className="event-content">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>  
                    </div>
                     <span className="event-time">{event.time}</span>
                  </div>
                  <TrashBinIcon width={34} height={34} onClick={handleDeleteClick(event.id)} />                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {deleteTargetId && (
              <div className="delete-confirm-overlay" onClick={cancelDelete}>
                <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                  <p>정말 이 일정을 삭제하시겠습니까?</p>
                  <div className="delete-confirm-actions">
                    <button className="delete-cancel-button" onClick={cancelDelete}>아니오</button>
                    <button className="delete-confirm-button" onClick={confirmDelete}>예</button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default CalendarDayClickModal;