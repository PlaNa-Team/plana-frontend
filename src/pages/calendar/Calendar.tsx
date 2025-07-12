// pages/calendar/Calendar.tsx - 최소한의 코드
import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import { updateCurrentDate, selectEvents } from '../../store/slices/calendarSlice';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);

  // 날짜 변경 핸들러
  const handleDatesSet = (dateInfo: any) => {
    dispatch(updateCurrentDate({ start: dateInfo.start }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <CalendarBase 
        height="800px"
        headerToolbar={{left: 'prev',center: 'title',right: 'next'}}
        locale="ko"
        className="schedule-calendar"
        events={events}
        onDatesSet={handleDatesSet}
      />
    </div>
  );
};

export default Calendar;