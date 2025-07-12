import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarBaseProps {
  events?: any[];
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (clickInfo: any) => void;
  onEventDrop?: (dropInfo: any) => void;
  onEventResize?: (resizeInfo: any) => void;
  onDatesSet?: (dateInfo: any) => void;
  initialView?: string;
  headerToolbar?: any;
  height?: string | number;
  editable?: boolean;
  selectable?: boolean;
  eventContent?: (eventInfo: any) => React.ReactElement | null;
  dayCellContent?: (dayInfo: any) => React.ReactElement | null;
  locale?: string;
  weekends?: boolean;
  businessHours?: any;
  className?: string;
}

const CalendarBase: React.FC<CalendarBaseProps> = ({
  events = [],
  onDateSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
  onDatesSet,
  initialView = 'dayGridMonth',
  headerToolbar = {
    left: 'prev',
    center: 'title',
    right: 'next'
  },
  height = 'auto',
  editable = false,
  selectable = true,
  eventContent,
  dayCellContent,
  locale = 'ko',
  weekends = true,
  businessHours,
  className = ''
}) => {
  
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // FullCalendar가 렌더링된 후 메모 컬럼 추가
  const addMemoColumn = () => {
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    // 헤더에 메모 컬럼 추가
    const headerRow = calendarEl.querySelector('.fc-col-header tr');
    if (headerRow && !headerRow.querySelector('.memo-header-cell')) {
      const memoHeaderCell = document.createElement('th');
      memoHeaderCell.className = 'fc-col-header-cell memo-header-cell';
      memoHeaderCell.innerHTML = `
        <div class="fc-scrollgrid-sync-inner">
          <div class="fc-col-header-cell-cushion">메모</div>
        </div>
      `;
      headerRow.appendChild(memoHeaderCell);
    }

    // 각 주차 행에 메모 셀 추가
    const bodyRows = calendarEl.querySelectorAll('.fc-daygrid-body tr[role="row"]');
    bodyRows.forEach((row: Element, weekIndex: number) => {
      if (!row.querySelector('.memo-body-cell')) {
        const memoBodyCell = document.createElement('td');
        memoBodyCell.className = 'fc-daygrid-day memo-body-cell';
        memoBodyCell.innerHTML = `
          <div class="fc-daygrid-day-frame">
            <div class="memo-content">
              <textarea 
                placeholder="${weekIndex + 1}주차 메모" 
                class="memo-textarea"
              ></textarea>
            </div>
          </div>
        `;
        row.appendChild(memoBodyCell);
      }
    });

    // 컬럼 너비 조정
    const allCells = calendarEl.querySelectorAll('.fc-col-header-cell, .fc-daygrid-day');
    allCells.forEach((cell: Element) => {
      (cell as HTMLElement).style.width = '12.5%';
    });
  };

  // FullCalendar 렌더링 후 실행
  const handleViewDidMount = () => {
    setTimeout(() => {
      addMemoColumn();
    }, 100);
  };

  // 날짜 변경 시에도 메모 컬럼 다시 추가
  const handleDatesSet = (dateInfo: any) => {
    if (onDatesSet) {
      onDatesSet(dateInfo);
    }
    setTimeout(() => {
      addMemoColumn();
    }, 100);
  };

  return (
    <div className={`calendar-base ${className}`} ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        height={height}
        events={events}
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={3}
        weekends={weekends}
        locale={locale}
        businessHours={businessHours}
        
        select={onDateSelect}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        datesSet={handleDatesSet}
        viewDidMount={handleViewDidMount}
        
        eventContent={eventContent}
        dayCellContent={dayCellContent}
        
        eventDisplay="block"
        dayMaxEventRows={3}
        moreLinkClick="popover"
        timeZone="Asia/Seoul"
        dayHeaderFormat={{ weekday: 'short' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
      />
    </div>
  );
};

export default CalendarBase;