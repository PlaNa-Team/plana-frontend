// pages/calendar/Calendar.tsx - 모달 상태 관리 추가
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import CalendarSearchModal from '../../components/ui/CalendarSearchModal';
import CalendarScheduleAddModal from '../../components/ui/CalendarScheduleAddModal';
import CalendarDayClickModal from '../../components/ui/CalendarDayClickModal';
import { updateCurrentDate, selectEvents } from '../../store/slices/calendarSlice';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);
  
  // 모달 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 일정 추가 모달 열기
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="calendar-container">
      {/* 검색 모달 - 기존 그대로 */}
      <CalendarSearchModal showSearchButton={true} />
      
      {/* 일정 추가 모달 */}
      <CalendarScheduleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {/* 날짜 클릭 모달 - onOpenAddModal 연결 */}
      <CalendarDayClickModal onOpenAddModal={handleOpenAddModal} />
      
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