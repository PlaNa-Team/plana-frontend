import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchHolidays } from '../../services/publicApi';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setHolidays,
  setLoadingHolidays,
  selectHolidays,
  selectIsLoadingHolidays
} from '../../store/slices/calendarSlice';
import { HolidayItem } from '../../types/calendar.types';

interface CalendarBaseProps {
  events?: any[];
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (clickInfo: any) => void;
  onEventDrop?: (dropInfo: any) => void;
  onEventResize?: (resizeInfo: any) => void;
  onDatesSet?: (dateInfo: any) => void;
  onDateClick?: (dateStr: string) => void; // 🆕 날짜 클릭 이벤트 추가
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
  onDateClick, // 🆕 새로운 prop
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
  const dispatch = useAppDispatch();
  const holidays = useAppSelector(selectHolidays);
  const isLoadingHolidays = useAppSelector(selectIsLoadingHolidays);
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadedYears = useRef<Set<string>>(new Set());

  // 🆕 날짜 클릭 핸들러 추가 (커스텀 이벤트 발생)
  const handleDateClick = (arg: any) => {
    // 커스텀 이벤트 발생으로 모달에게 알림
    const event = new CustomEvent('calendar-date-click', {
      detail: { dateStr: arg.dateStr }
    });
    window.dispatchEvent(event);

    // 기존 onDateClick prop도 유지 (하위 호환성)
    if (onDateClick) {
      onDateClick(arg.dateStr);
    }
  };

  const loadHolidays = React.useCallback(
    async (year: string) => {
      if (loadedYears.current.has(year)) {
        return;
      }
      loadedYears.current.add(year);

      try {
        dispatch(setLoadingHolidays(true));
        const holidayData = await fetchHolidays(year);
        dispatch(setHolidays(holidayData));
      } catch (error) {
        dispatch(setHolidays([]));
      } finally {
        dispatch(setLoadingHolidays(false));
      }
    },
    [dispatch]
  );

  const isHoliday = React.useCallback(
    (date: Date): boolean => {
      const dateString =
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate();
      return holidays.some(
        (holiday: HolidayItem) =>
          holiday.locdate === dateString && holiday.isHoliday === 'Y'
      );
    },
    [holidays]
  );

  const getDayColorClass = React.useCallback(
    (date: Date): string => {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || isHoliday(date)) {
        return 'sunday-holiday';
      } else if (dayOfWeek === 6) {
        return 'saturday';
      }
      return 'weekday';
    },
    [isHoliday]
  );

  const applyDateColors = React.useCallback(() => {
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((cell: Element) => {
      const dateAttr = cell.getAttribute('data-date');
      if (dateAttr) {
        const date = new Date(dateAttr);
        const colorClass = getDayColorClass(date);

        cell.classList.remove('sunday-holiday', 'saturday', 'weekday');
        cell.classList.add(colorClass);
      }
    });
  }, [getDayColorClass]);

  const handleTextareaClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    target.focus();
  };

  const handleTextareaFocus = (e: Event) => {
    e.stopPropagation();
  };

  const handleTextareaMouseDown = (e: Event) => {
    e.stopPropagation();
  };

  const renderDayCellContent = React.useCallback(
    (dayInfo: any) => {
      if (dayCellContent) {
        return dayCellContent(dayInfo);
      }
      const dayNumber = dayInfo.date.getDate();
      const colorClass = getDayColorClass(dayInfo.date);
      return (
        <div className={`fc-daygrid-day-number ${colorClass}`}>
          {dayNumber}
        </div>
      );
    },
    [dayCellContent, getDayColorClass]
  );

  const addMemoColumn = React.useCallback(() => {
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    const allCells = calendarEl.querySelectorAll(
      '.fc-col-header-cell, .fc-daygrid-day'
    );
    allCells.forEach((cell: Element) => {
      (cell as HTMLElement).style.width = '12.5%';
    });

    const headerRow = calendarEl.querySelector('.fc-col-header tr');
    if (headerRow && !headerRow.querySelector('.memo-header-cell')) {
      const memoHeaderCell = document.createElement('th');
      memoHeaderCell.className = 'fc-col-header-cell memo-header-cell';
      memoHeaderCell.style.width = '12.5%';
      memoHeaderCell.innerHTML = `
        <div class="fc-scrollgrid-sync-inner">
          <div class="fc-col-header-cell-cushion">메모</div>
        </div>
      `;
      headerRow.appendChild(memoHeaderCell);
    }

    const bodyRows = calendarEl.querySelectorAll(
      '.fc-daygrid-body tr[role="row"]'
    );
    bodyRows.forEach((row: Element) => {
      if (!row.querySelector('.memo-body-cell')) {
        const memoBodyCell = document.createElement('td');
        memoBodyCell.className = 'fc-daygrid-day memo-body-cell';
        memoBodyCell.style.width = '12.5%';
        memoBodyCell.innerHTML = `
          <div class="fc-daygrid-day-frame">
            <div class="memo-content">
              <textarea 
                placeholder="텍스트를 입력하세요" 
                class="memo-textarea"
              ></textarea>
            </div>
          </div>
        `;
        row.appendChild(memoBodyCell);
      }
    });

    const textareas = calendarEl.querySelectorAll('.memo-textarea');
    textareas.forEach((textarea: Element) => {
      const textareaEl = textarea as HTMLTextAreaElement;
      textareaEl.removeEventListener('click', handleTextareaClick);
      textareaEl.removeEventListener('focus', handleTextareaFocus);
      textareaEl.removeEventListener('mousedown', handleTextareaMouseDown);

      textareaEl.addEventListener('click', handleTextareaClick);
      textareaEl.addEventListener('focus', handleTextareaFocus);
      textareaEl.addEventListener('mousedown', handleTextareaMouseDown);
    });

    const handleCalendarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.memo-textarea')) {
        const allTextareas =
          calendarEl.querySelectorAll('.memo-textarea') as NodeListOf<HTMLTextAreaElement>;
        allTextareas.forEach((textarea) => {
          textarea.blur();
        });
      }
    };

    calendarEl.removeEventListener('click', handleCalendarClick);
    calendarEl.addEventListener('click', handleCalendarClick);
  }, []);

  const updateCalendar = React.useCallback(() => {
    requestAnimationFrame(() => {
      addMemoColumn();
      applyDateColors();
    });
  }, [addMemoColumn, applyDateColors]);

  const handleLoading = (isLoading: boolean) => {
    if (!isLoading) {
      updateCalendar();
    }
  };

  const handleViewDidMount = () => {
    updateCalendar();
  };

  const handleDatesSet = React.useCallback(
    (dateInfo: any) => {
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }

      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);
      const middleDate = new Date(
        (startDate.getTime() + endDate.getTime()) / 2
      );
      const currentYear = middleDate.getFullYear().toString();

      loadHolidays(currentYear);
      updateCalendar();
    },
    [onDatesSet, loadHolidays, updateCalendar]
  );

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    loadHolidays(currentYear);
  }, [loadHolidays]);

  useEffect(() => {
    if (!isLoadingHolidays && holidays.length > 0) {
      const timer = setTimeout(() => {
        applyDateColors();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [holidays.length, isLoadingHolidays, applyDateColors]);

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
        dateClick={handleDateClick} // 🆕 날짜 클릭 이벤트 연결
        datesSet={handleDatesSet}
        viewDidMount={handleViewDidMount}
        loading={handleLoading}
        eventContent={eventContent}
        dayCellContent={renderDayCellContent}
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