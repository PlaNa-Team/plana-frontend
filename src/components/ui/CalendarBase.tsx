import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchHolidays } from '../../services/publicApi';
import { 
  setHolidays, 
  setLoadingHolidays, 
  selectHolidays,
  selectIsLoadingHolidays 
} from '../../store/slices/calendarSlice';

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
  
  const dispatch = useDispatch();
  const holidays = useSelector(selectHolidays);
  const isLoadingHolidays = useSelector(selectIsLoadingHolidays);
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 공휴일 데이터 로드
  const loadHolidays = async (year: string) => {
    try {
      dispatch(setLoadingHolidays(true));
      const holidayData = await fetchHolidays(year);
      dispatch(setHolidays(holidayData));
    } catch (error) {
      console.error('공휴일 데이터 로드 실패:', error);
      dispatch(setHolidays([]));
    } finally {
      dispatch(setLoadingHolidays(false));
    }
  };

  // 날짜가 공휴일인지 확인하는 함수
  const isHoliday = (date: Date): boolean => {
    const dateString = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    return holidays.some(holiday => holiday.locdate === dateString && holiday.isHoliday === 'Y');
  };

  // 요일별 색상 클래스 반환
  const getDayColorClass = (date: Date): string => {
    const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
    
    if (dayOfWeek === 0 || isHoliday(date)) {
      return 'sunday-holiday'; // 일요일 또는 공휴일: 빨간색
    } else if (dayOfWeek === 6) {
      return 'saturday'; // 토요일: 파란색
    }
    return 'weekday'; // 평일: 기본색
  };

  // textarea 이벤트 핸들러들
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

  // 날짜 숫자 색상 적용하여 표시
  const renderDayCellContent = (dayInfo: any) => {
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
  };

  // 날짜 색상 적용 함수
  const applyDateColors = () => {
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    // 모든 날짜 셀에 색상 클래스 적용
    const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((cell: Element) => {
      const dateAttr = cell.getAttribute('data-date');
      if (dateAttr) {
        const date = new Date(dateAttr);
        const colorClass = getDayColorClass(date);
        
        // 기존 색상 클래스 제거
        cell.classList.remove('sunday-holiday', 'saturday', 'weekday');
        
        // 새 색상 클래스 추가
        cell.classList.add(colorClass);
      }
    });
  };

  // 메모 컬럼 추가 (최적화된 버전)
  const addMemoColumn = () => {
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    // 먼저 모든 셀의 너비를 미리 설정 (깜빡임 방지)
    const allCells = calendarEl.querySelectorAll('.fc-col-header-cell, .fc-daygrid-day');
    allCells.forEach((cell: Element) => {
      (cell as HTMLElement).style.width = '12.5%';
    });

    // 헤더에 메모 컬럼 추가
    const headerRow = calendarEl.querySelector('.fc-col-header tr');
    if (headerRow && !headerRow.querySelector('.memo-header-cell')) {
      const memoHeaderCell = document.createElement('th');
      memoHeaderCell.className = 'fc-col-header-cell memo-header-cell';
      memoHeaderCell.style.width = '12.5%'; // 즉시 너비 설정
      memoHeaderCell.innerHTML = `
        <div class="fc-scrollgrid-sync-inner">
          <div class="fc-col-header-cell-cushion">메모</div>
        </div>
      `;
      headerRow.appendChild(memoHeaderCell);
    }

    // 각 행에 메모 셀 추가
    const bodyRows = calendarEl.querySelectorAll('.fc-daygrid-body tr[role="row"]');
    bodyRows.forEach((row: Element) => {
      if (!row.querySelector('.memo-body-cell')) {
        const memoBodyCell = document.createElement('td');
        memoBodyCell.className = 'fc-daygrid-day memo-body-cell';
        memoBodyCell.style.width = '12.5%'; // 즉시 너비 설정
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

    // innerHTML로 추가한 후 이벤트 리스너 등록
    const textareas = calendarEl.querySelectorAll('.memo-textarea');
    textareas.forEach((textarea: Element) => {
      const textareaEl = textarea as HTMLTextAreaElement;
      
      // 기존 이벤트 리스너 제거 (중복 방지)
      textareaEl.removeEventListener('click', handleTextareaClick);
      textareaEl.removeEventListener('focus', handleTextareaFocus);
      textareaEl.removeEventListener('mousedown', handleTextareaMouseDown);
      
      // 새 이벤트 리스너 추가
      textareaEl.addEventListener('click', handleTextareaClick);
      textareaEl.addEventListener('focus', handleTextareaFocus);
      textareaEl.addEventListener('mousedown', handleTextareaMouseDown);
    });

    // 캘린더 전체에 클릭 이벤트 추가 (textarea 밖 클릭시 포커스 해제)
    const handleCalendarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // 클릭한 요소가 textarea가 아니면 모든 textarea 포커스 해제
      if (!target.closest('.memo-textarea')) {
        const allTextareas = calendarEl.querySelectorAll('.memo-textarea') as NodeListOf<HTMLTextAreaElement>;
        allTextareas.forEach(textarea => {
          textarea.blur();
        });
      }
    };

    // 기존 이벤트 리스너 제거 후 새로 추가
    calendarEl.removeEventListener('click', handleCalendarClick);
    calendarEl.addEventListener('click', handleCalendarClick);
  };

  // 캘린더 업데이트 함수 (메모 컬럼 + 색상 적용)
  const updateCalendar = () => {
    requestAnimationFrame(() => {
      addMemoColumn();
      applyDateColors();
    });
  };

  // 로딩 상태에서 미리 처리
  const handleLoading = (isLoading: boolean) => {
    if (!isLoading) {
      updateCalendar();
    }
  };

  // FullCalendar 렌더링 후 실행
  const handleViewDidMount = () => {
    updateCalendar();
  };

  // 날짜 변경 시 처리
  const handleDatesSet = (dateInfo: any) => {
    if (onDatesSet) {
      onDatesSet(dateInfo);
    }
    
    // 년도가 변경되면 공휴일 데이터 새로 로드
    const currentYear = new Date(dateInfo.start).getFullYear().toString();
    const holidayYear = holidays.length > 0 ? Math.floor(holidays[0].locdate / 10000).toString() : '';
    
    if (currentYear !== holidayYear) {
      loadHolidays(currentYear);
    }
    
    updateCalendar();
  };

  // 컴포넌트 마운트 시 현재 년도 공휴일 로드
  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    loadHolidays(currentYear);
  }, []);

  // 공휴일 데이터가 변경되면 색상 다시 적용
  useEffect(() => {
    if (!isLoadingHolidays) {
      requestAnimationFrame(() => {
        applyDateColors();
      });
    }
  }, [holidays, isLoadingHolidays]);

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