// pages/calendar/Calendar.tsx - 최소한의 코드
import React from 'react';
import { useAppSelector } from '../../store';
import CalendarBase from '../../components/ui/CalendarBase';
import { selectEvents } from '../../store/slices/calendarSlice';


const Calendar: React.FC = () => {
  const events = useAppSelector(selectEvents);

  return (
    <div>
      <CalendarBase 
        height="800px"
        headerToolbar={{left: 'prev',center: 'title',right: 'next'}}
        locale="ko"
        className="schedule-calendar"
        events={events}
      />
    </div>
  );
};

export default Calendar;