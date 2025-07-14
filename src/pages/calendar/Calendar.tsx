// pages/calendar/Calendar.tsx - 최소한의 코드
import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import CalendarSearchModal from '../../components/ui/CalendarSearchModal';
import CalendarDayClickModal from '../../components/ui/CalendarDayClickModal';
import { updateCurrentDate, selectEvents } from '../../store/slices/calendarSlice';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);

  // 날짜 변경 핸들러
  const handleDatesSet = (dateInfo: any) => {
    dispatch(updateCurrentDate({ start: dateInfo.start }));
  };

  return (
    <div className="calendar-container">
      {/* 검색 모달 - 자체 관리 */}
      <CalendarSearchModal showSearchButton={true} />
      
      {/* 날짜 클릭 모달 - 자체 관리 */}
      <CalendarDayClickModal />
      
      {/* 캘린더 */}
      <CalendarBase 
        height="800px"
        headerToolbar={{left: 'prev', center: 'title', right: 'next'}}
        locale="ko"
        className="schedule-calendar"
        events={events}
        onDatesSet={handleDatesSet}
      />
    </div>
  );
};

export default Calendar;