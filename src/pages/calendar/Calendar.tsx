// pages/calendar/Calendar.tsx - 간단한 컴포넌트 조합 파일
import React, { useState } from 'react';
import { useAppSelector } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import CalendarSearchModal from '../../components/ui/CalendarSearchModal';
import CalendarScheduleAddModal from '../../components/ui/CalendarScheduleAddModal';
import CalendarDayClickModal from '../../components/ui/CalendarDayClickModal';
import { selectEvents } from '../../store/slices/calendarSlice';
import { ScheduleFormData } from '../../types/calendar.types';

// 모달 상태 타입 정의
interface ScheduleModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  selectedDate?: string;
  scheduleData?: ScheduleFormData;
}

const Calendar: React.FC = () => {
  const events = useAppSelector(selectEvents);
  
  // 스케줄 모달 상태만 관리
  const [scheduleModalState, setScheduleModalState] = useState<ScheduleModalState>({
    isOpen: false,
    mode: 'add',
    selectedDate: undefined,
    scheduleData: undefined
  });

  // 일정 추가 모달 열기
  const handleOpenAddModal = (selectedDate: string) => {
    setScheduleModalState({
      isOpen: true,
      mode: 'add',
      selectedDate: selectedDate,
      scheduleData: undefined
    });
  };

  // 일정 수정 모달 열기
  const handleOpenEditModal = (scheduleData: ScheduleFormData) => {
    setScheduleModalState({
      isOpen: true,
      mode: 'edit',
      selectedDate: scheduleData.startDate,
      scheduleData: scheduleData
    });
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setScheduleModalState({
      isOpen: false,
      mode: 'add',
      selectedDate: undefined,
      scheduleData: undefined
    });
  };

  return (
    <div className="calendar-container">
      {/* 검색 모달 */}
      <CalendarSearchModal showSearchButton={true} />
      
      {/* 일정 추가/수정 모달 */}
      <CalendarScheduleAddModal
        isOpen={scheduleModalState.isOpen}
        mode={scheduleModalState.mode}
        selectedDate={scheduleModalState.selectedDate}
        scheduleData={scheduleModalState.scheduleData}
        onClose={handleCloseModal}
        // onSave와 onDelete는 각 모달에서 처리
        onSave={() => {}} // 빈 함수로 일단 전달
        onDelete={() => {}} // 빈 함수로 일단 전달
      />
      
      {/* 날짜 클릭 모달 */}
      <CalendarDayClickModal 
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
      />
      
      {/* 캘린더 컴포넌트 */}
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