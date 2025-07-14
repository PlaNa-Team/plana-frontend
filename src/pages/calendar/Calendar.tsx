// pages/calendar/Calendar.tsx - 최종 깔끔한 버전
import React from 'react';
import { useAppSelector } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import CalendarSearchModal from '../../components/ui/CalendarSearchModal';
import { selectEvents } from '../../store/slices/calendarSlice';

const Calendar: React.FC = () => {
  const events = useAppSelector(selectEvents);

  return (
    <div className="calendar-container">
      {/* 검색 모달 - 자체적으로 버튼과 모달 관리 */}
      <CalendarSearchModal showSearchButton={true} />
      
      {/* 캘린더 */}
      <CalendarBase 
        height="800px"
        headerToolbar={{left: 'prev', center: 'title', right: 'next'}}
        locale="ko"
        className="schedule-calendar"
        events={events}
      />
    </div>
  );
};

export default Calendar;