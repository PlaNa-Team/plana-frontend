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
  selectEvents,
  selectIsLoadingEvents,
  fetchMonthlySchedules,
  updateCurrentDate,
} from '../../store/slices/calendarSlice';
import { HolidayItem, MemoItem } from '../../types/calendar.types';
import { calendarAPI } from '../../services/api';

// 주차 계산 헬퍼 함수
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

interface CalendarBaseProps {
  events?: any[];
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (clickInfo: any) => void;
  onEventDrop?: (dropInfo: any) => void;
  onEventResize?: (resizeInfo: any) => void;
  onDatesSet?: (dateInfo: any) => void;
  onDateClick?: (dateStr: string) => void;
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
  onDateSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
  onDatesSet,
  onDateClick,
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
  const scheduleEvents = useAppSelector(selectEvents);
  const isLoadingEvents = useAppSelector(selectIsLoadingEvents);
  // ✅ 삭제: 메모 로딩 상태 가져오기
  // const isLoadingMemos = useAppSelector(selectIsLoadingMemos); 
  
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedYears = useRef<Set<string>>(new Set());
  const isUpdating = useRef<boolean>(false);

  const handleDateClick = (arg: any) => {
    const event = new CustomEvent('calendar-date-click', {
      detail: { dateStr: arg.dateStr }
    });
    window.dispatchEvent(event);

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

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    target.focus();
  };

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const handleTextareaMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
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

  const addMemoColumn = React.useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    
    // ✅ 삭제: dispatch(setLoadingMemos(true));

    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) {
      isUpdating.current = false;
      // ✅ 삭제: dispatch(setLoadingMemos(false));
      return;
    }

    const currentDate = calendarRef.current?.getApi().getDate() || new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let monthlyMemos: MemoItem[] = [];
    try {
      monthlyMemos = await calendarAPI.getMonthlyMemos(currentYear, currentMonth, "스케줄");
    } catch (error) {
      console.error("월별 메모 조회 실패:", error);
    } finally {
      // ✅ 삭제: dispatch(setLoadingMemos(false));
    }

    let memoHeaderCell = calendarEl.querySelector('.memo-header-cell') as HTMLElement | null;
    if (!memoHeaderCell) {
      const headerRow = calendarEl.querySelector('.fc-col-header tr');
      if (headerRow) {
        memoHeaderCell = document.createElement('th');
        memoHeaderCell.className = 'fc-col-header-cell memo-header-cell';
        memoHeaderCell.style.width = '12.5%';
        memoHeaderCell.innerHTML = `<div class="fc-scrollgrid-sync-inner"><div class="fc-col-header-cell-cushion">메모</div></div>`;
        headerRow.appendChild(memoHeaderCell);
      }
    }
    
    calendarEl.querySelectorAll('.fc-col-header-cell, .fc-daygrid-day').forEach((cell: Element) => {
        (cell as HTMLElement).style.width = '12.5%';
    });

    const bodyRows = calendarEl.querySelectorAll('.fc-daygrid-body tr[role="row"]');
    const processedWeeks = new Set<number>();

    for (const row of Array.from(bodyRows)) {
      const dateCells = row.querySelectorAll('.fc-daygrid-day[data-date]');
      if (dateCells.length === 0) continue;

      let weekDate: Date | null = null;
      for (const cell of Array.from(dateCells)) { 
          const dateAttr = cell.getAttribute('data-date');
          if (dateAttr) {
              const cellDate = new Date(dateAttr);
              if (cellDate.getFullYear() === currentYear && (cellDate.getMonth() + 1 === currentMonth || Math.abs((cellDate.getFullYear() * 12 + cellDate.getMonth()) - (currentYear * 12 + currentMonth - 1)) <= 1)) {
                  if (!weekDate || cellDate.getMonth() + 1 === currentMonth) {
                      weekDate = cellDate;
                  }
              }
          }
      }

      if (!weekDate) continue;

      const weekNumber = getWeekNumber(weekDate);
      if (processedWeeks.has(weekNumber)) {
          continue;
      }
      processedWeeks.add(weekNumber);
      
      const existingMemo = monthlyMemos.find(memo => memo.week === weekNumber && memo.year === currentYear) || null;

      let memoBodyCell = row.querySelector('.memo-body-cell') as HTMLElement | null;
      let textareaEl: HTMLTextAreaElement | null = null;
      
      if (!memoBodyCell) {
          memoBodyCell = document.createElement('td');
          memoBodyCell.className = 'fc-daygrid-day memo-body-cell';
          memoBodyCell.style.width = '12.5%';
          memoBodyCell.innerHTML = `<div class="fc-daygrid-day-frame"><div class="memo-content"><textarea placeholder="텍스트를 입력하세요" class="memo-textarea"></textarea></div></div>`;
          row.appendChild(memoBodyCell);
          textareaEl = memoBodyCell.querySelector('.memo-textarea');
      } else {
          textareaEl = memoBodyCell.querySelector('.memo-textarea');
      }

      if (textareaEl) {
        textareaEl.value = existingMemo?.content || '';
        textareaEl.setAttribute('data-memo-id', existingMemo?.id?.toString() || '');
        textareaEl.setAttribute('data-week', weekNumber.toString());
        textareaEl.setAttribute('data-year', currentYear.toString());
      }
    }

    const textareas = calendarEl.querySelectorAll('.memo-textarea');
    textareas.forEach(textareaEl => {
      textareaEl.addEventListener('click', handleTextareaClick as unknown as EventListener);
      textareaEl.addEventListener('focus', handleTextareaFocus as unknown as EventListener);
      textareaEl.addEventListener('mousedown', handleTextareaMouseDown as unknown as EventListener);
      textareaEl.addEventListener('blur', saveMemo);
    });

    isUpdating.current = false;
  }, [handleTextareaClick, handleTextareaFocus, handleTextareaMouseDown]);

  const saveMemo = React.useCallback(async (e: Event) => {
    const textareaEl = e.target as HTMLTextAreaElement;
    const content = textareaEl.value.trim();
    if (!content) return;

    const memoId = textareaEl.getAttribute('data-memo-id');
    const week = parseInt(textareaEl.getAttribute('data-week') || '1');
    const year = parseInt(textareaEl.getAttribute('data-year') || '0');

    try {
      if (memoId && memoId !== '') {
        await calendarAPI.updateMemo({
          id: parseInt(memoId),
          content,
          type: '스케줄'
        });
      } else {
        const newMemo = await calendarAPI.createMemo({
          content,
          year,
          week,
          type: '스케줄'
        });
        textareaEl.setAttribute('data-memo-id', newMemo.id.toString());
      }
      
      textareaEl.style.borderColor = '#4CAF50';
      setTimeout(() => { textareaEl.style.borderColor = ''; }, 1000);
    } catch (error) {
      console.error('메모 저장 실패:', error);
      textareaEl.style.borderColor = '#f44336';
      setTimeout(() => { textareaEl.style.borderColor = ''; }, 2000);
    }
  }, []);

  const updateCalendar = React.useCallback(() => {
    addMemoColumn();
    applyDateColors();
  }, [addMemoColumn, applyDateColors]);

  const handleLoading = (isLoading: boolean) => {
    if (!isLoading) {
      updateCalendar();
    }
  };

  const handleDatesSet = React.useCallback(
    async (dateInfo: any) => {
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }
      
      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);
      const middleDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
      
      const currentYear = middleDate.getFullYear();
      const currentMonth = middleDate.getMonth() + 1;

      isUpdating.current = false;
      loadHolidays(currentYear.toString());

      try {
        dispatch(updateCurrentDate({ start: dateInfo.startStr }));
        await dispatch(fetchMonthlySchedules({ year: currentYear, month: currentMonth })).unwrap();
      } catch (error) {
        console.error('일정 로드 실패:', error);
      }
      updateCalendar();
    },
    [onDatesSet, dispatch, loadHolidays, updateCalendar]
  );
  
  const renderMoreLinkContent = (info: any) => {
    return <div className="custom-more-link">더보기</div>;
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    dispatch(fetchMonthlySchedules({ year, month }));
  }, [dispatch]);
  
  return (
    <div className={`calendar-base ${className}`} ref={containerRef}>
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
      {/* ✅ 삭제: 메모 로딩 오버레이 부분 */}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        height={height}
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
        datesSet={handleDatesSet}
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