import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
// FullCalendar의 월간 보기 플러그인
import dayGridPlugin from '@fullcalendar/daygrid';
// 사용자 상호작용(클릭, 드래그) 플러그인
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarBaseProps {
  events?: any[];                    // 달력에 표시할 이벤트 배열
  onDateSelect?: (selectInfo: any) => void;     // 날짜 선택 시 호출되는 콜백
  onEventClick?: (clickInfo: any) => void;      // 이벤트 클릭 시 콜백
  onEventDrop?: (dropInfo: any) => void;        // 이벤트 드래그&드롭 시 콜백
  onEventResize?: (resizeInfo: any) => void;    // 이벤트 크기 조정 시 콜백
  onDatesSet?: (dateInfo: any) => void;         // 달력 날짜 범위 변경 시 콜백
  initialView?: string;             // 초기 달력 뷰 모드 (월간/주간/일간)
  headerToolbar?: any;              // 헤더 툴바 설정 (이전/다음 버튼, 제목 등)
  height?: string | number;         // 달력 높이
  editable?: boolean;               // 이벤트 편집 가능 여부
  selectable?: boolean;             // 날짜 선택 가능 여부
  eventContent?: (eventInfo: any) => React.ReactElement | null;  // 사용자 정의 이벤트 렌더링
  dayCellContent?: (dayInfo: any) => React.ReactElement | null;  // 사용자 정의 날짜 셀 렌더링
  locale?: string;                  // 언어 설정
  weekends?: boolean;               // 주말 표시 여부
  businessHours?: any;              // 업무 시간 설정
  className?: string;               // CSS 클래스명
}

const CalendarBase: React.FC<CalendarBaseProps> = ({
  // Props의 기본값들 설정
  events = [],                      // 빈 배열로 초기화
  onDateSelect,                     // 선택적 콜백들
  onEventClick,
  onEventDrop,
  onEventResize,
  onDatesSet,
  initialView = 'dayGridMonth',     // 기본값: 월간 보기
  headerToolbar = {                 // 기본 헤더 설정
    left: 'prev',                   // 왼쪽: 이전 버튼
    center: 'title',                // 가운데: 제목
    right: 'next'                   // 오른쪽: 다음 버튼
  },
  height = 'auto',                  // 기본 높이: 자동
  editable = false,                 // 기본값: 편집 불가
  selectable = true,                // 기본값: 선택 가능
  eventContent,                     // 선택적 렌더링 함수들
  dayCellContent,
  locale = 'ko',                    // 기본 언어: 한국어
  weekends = true,                  // 기본값: 주말 표시
  businessHours,                    // 선택적 업무시간
  className = ''                    // 기본 CSS 클래스: 없음
}) => {
  
  const calendarRef = useRef<FullCalendar>(null);
  // 달력을 감싸는 컨테이너 DOM 참조용 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // textarea 이벤트 핸들러들
  const handleTextareaClick = (e: Event) => {
    e.stopPropagation();    // 이벤트 버블링 중단
    e.preventDefault();     // 기본 동작 방지
    const target = e.target as HTMLTextAreaElement;
    target.focus();         // 텍스트영역에 포커스
  };

  // 메모 텍스트영역 포커스 이벤트 핸들러
  const handleTextareaFocus = (e: Event) => {
    e.stopPropagation();    // 상위로 이벤트 전파 방지
  };

  // 메모 텍스트영역 마우스다운 이벤트 핸들러
  const handleTextareaMouseDown = (e: Event) => {
    e.stopPropagation();    // 상위로 이벤트 전파 방지
  };

  // 날짜 숫자만 표시 (일 제거)
  const renderDayCellContent = (dayInfo: any) => {
    if (dayCellContent) {
      return dayCellContent(dayInfo);
    }
    
    const dayNumber = dayInfo.date.getDate();
    
    return (
      <div className="fc-daygrid-day-number">
        {dayNumber}
      </div>
    );
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
      memoHeaderCell.style.width = '12.5%';
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

    // innerHTML로 추가한 후 이벤트 리스너 등록
    const textareas = calendarEl.querySelectorAll('.memo-textarea');
    textareas.forEach((textarea: Element) => {
      const textareaEl = textarea as HTMLTextAreaElement;
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

  // 로딩 상태에서 미리 처리
  const handleLoading = (isLoading: boolean) => {
    if (!isLoading) {
      // 로딩 완료 직후 즉시 실행 (지연 최소화)
      requestAnimationFrame(() => {
        addMemoColumn();
      });
    }
  };

  // FullCalendar 렌더링 후 실행 (지연 시간 단축)
  const handleViewDidMount = () => {
    requestAnimationFrame(() => {
      addMemoColumn();
    });
  };

  // 날짜 변경 시 처리 (지연 시간 단축)
  const handleDatesSet = (dateInfo: any) => {
    if (onDatesSet) {
      onDatesSet(dateInfo);
    }
    
    // setTimeout 대신 requestAnimationFrame 사용 (더 부드러움)
    requestAnimationFrame(() => {
      addMemoColumn();
    });
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
        loading={handleLoading} // 로딩 상태 처리 추가
        
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
