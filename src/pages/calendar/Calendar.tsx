import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>캘린더 페이지</h2>
      <p>여기에 FullCalendar가 들어갈 예정입니다.</p>
      <div style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>캘린더 영역</span>
      </div>
    </div>
  );
};

export default Calendar;