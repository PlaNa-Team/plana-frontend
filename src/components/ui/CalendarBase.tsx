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
  selectIsLoadingHolidays,
  selectEvents,
  selectIsLoadingEvents,
  selectEventsError,
  fetchMonthlySchedules,
  updateCurrentDate
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
  // events = [],
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
  // ✅ 기존 공휴일 관련 (그대로 유지)
  const holidays = useAppSelector(selectHolidays);
  
  // 🆕 일정 관련 추가 (아직 사용 안 함)
  const scheduleEvents = useAppSelector(selectEvents);
  const isLoadingEvents = useAppSelector(selectIsLoadingEvents);
  
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
    async (dateInfo: any) => {
      // ✅ 기존 로직 그대로 유지
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }

      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);
      const middleDate = new Date(
        (startDate.getTime() + endDate.getTime()) / 2
      );
      
      const currentYear = middleDate.getFullYear();
      const currentMonth = middleDate.getMonth() + 1;
      const currentYearStr = currentYear.toString();

      // ✅ 기존 공휴일 로딩 유지
      loadHolidays(currentYearStr);
      updateCalendar();

      // 🆕 일정 API 호출만 추가 (콘솔로만 확인)
      try {
        console.log(`📅 ${currentYear}년 ${currentMonth}월 일정 조회 시작`);
        
        // 🔄 Redux 상태 업데이트
        dispatch(updateCurrentDate({ start: dateInfo.start.toISOString() }));
        
        // 🚀 API 호출
        const result = await dispatch(fetchMonthlySchedules({ 
          year: currentYear, 
          month: currentMonth 
        })).unwrap();
        
        console.log('✅ 일정 데이터:', result);
      } catch (error) {
        console.error('❌ 일정 로드 실패:', error);
      }
    },
    [onDatesSet, dispatch, loadHolidays, updateCalendar]
  );

  // 🆕 `moreLinkContent` 커스텀 함수 추가
  const renderMoreLinkContent = (info: any) => {
    return (
      <div className="custom-more-link">
        더보기
      </div>
    );
  };

  // 🆕 컴포넌트 마운트시에도 현재 월 데이터 로드
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    console.log('🚀 초기 일정 데이터 로드');
    dispatch(fetchMonthlySchedules({ year: currentYear, month: currentMonth }));
  }, [dispatch]);


  return (
    <div className={`calendar-base ${className}`} ref={containerRef}>
      {/* 🆕 개발자 도구용 정보 표시 (나중에 제거) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          background: '#f0f0f0', 
          padding: '5px', 
          fontSize: '12px',
          zIndex: 1000
        }}>
          Redux 일정: {scheduleEvents.length}개 | 로딩: {isLoadingEvents ? 'Y' : 'N'}
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        height={height}
        
        // 🔄 아직은 props events 사용 (나중에 scheduleEvents로 교체)
        events={scheduleEvents}
        
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
        dateClick={handleDateClick}
        
        // 🆕 API 호출 포함된 핸들러
        datesSet={handleDatesSet}
        
        viewDidMount={handleViewDidMount}
        loading={handleLoading}
        eventContent={eventContent}
        dayCellContent={renderDayCellContent}
        eventDisplay="block"
        dayMaxEventRows={3}
        moreLinkClick="popover"
        moreLinkContent={renderMoreLinkContent}
        timeZone="Asia/Seoul"
        dayHeaderFormat={{ weekday: 'short' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
      />
    </div>
  );
};

export default CalendarBase;