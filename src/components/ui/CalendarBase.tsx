import React, { useRef, useEffect } from 'react';
// FullCalendar React 컴포넌트 가져오기
import FullCalendar from '@fullcalendar/react';
// FullCalendar의 월간 보기 플러그인
import dayGridPlugin from '@fullcalendar/daygrid';
// 사용자 상호작용(클릭, 드래그) 플러그인
import interactionPlugin from '@fullcalendar/interaction';
// 공휴일 데이터를 가져오는 API 서비스
import { fetchHolidays } from '../../services/publicApi';
// Redux 훅들 - 상태 조작 및 읽기
import { useAppDispatch, useAppSelector } from '../../store';
// Redux 액션들과 셀렉터들 - 공휴일 상태 관리
import {
  setHolidays,
  setLoadingHolidays,
  selectHolidays,
  selectIsLoadingHolidays
} from '../../store/slices/calendarSlice';
// TypeScript 타입 정의
import { HolidayItem } from '../../types/calendar.types';

// CalendarBase 컴포넌트의 Props 타입 정의
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
  // Redux 디스패치 함수 가져오기 - 액션 발생용
  const dispatch = useAppDispatch();
  // Redux 상태에서 공휴일 데이터 읽기
  const holidays = useAppSelector(selectHolidays);
  // Redux 상태에서 공휴일 로딩 상태 읽기
  const isLoadingHolidays = useAppSelector(selectIsLoadingHolidays);
  
  // FullCalendar 컴포넌트 참조용 ref
  const calendarRef = useRef<FullCalendar>(null);
  // 달력을 감싸는 컨테이너 DOM 참조용 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 이미 로드된 연도들을 기록하는 Set (중복 요청 방지)
  const loadedYears = useRef<Set<string>>(new Set());

  // 특정 연도의 공휴일 데이터를 로드하는 함수
  const loadHolidays = React.useCallback(
    async (year: string) => {
      // 이미 로드된 연도라면 중복 요청하지 않음
      if (loadedYears.current.has(year)) {
        return;
      }
      // 로드된 연도 목록에 추가
      loadedYears.current.add(year);

      try {
        // 로딩 상태를 true로 설정
        dispatch(setLoadingHolidays(true));
        // API에서 해당 연도의 공휴일 데이터 가져오기
        const holidayData = await fetchHolidays(year);
        // Redux 스토어에 공휴일 데이터 저장
        dispatch(setHolidays(holidayData));
      } catch (error) {
        // 에러 발생 시 빈 배열로 설정
        dispatch(setHolidays([]));
      } finally {
        // 로딩 상태를 false로 설정
        dispatch(setLoadingHolidays(false));
      }
    },
    [dispatch] // dispatch가 변경될 때만 함수 재생성
  );

  // 특정 날짜가 공휴일인지 확인하는 함수
  const isHoliday = React.useCallback(
    (date: Date): boolean => {
      // 날짜를 YYYYMMDD 형태의 숫자로 변환
      const dateString =
        date.getFullYear() * 10000 +          // 연도 * 10000
        (date.getMonth() + 1) * 100 +         // 월 * 100 (getMonth()는 0부터 시작)
        date.getDate();                       // 일
      
      // 공휴일 배열에서 해당 날짜가 공휴일인지 확인
      return holidays.some(
        (holiday: HolidayItem) =>
          holiday.locdate === dateString &&   // 날짜가 일치하고
          holiday.isHoliday === 'Y'           // 공휴일 여부가 'Y'인 경우
      );
    },
    [holidays] // holidays 배열이 변경될 때만 함수 재생성
  );

  // 날짜별 색상 클래스를 결정하는 함수
  const getDayColorClass = React.useCallback(
    (date: Date): string => {
      const dayOfWeek = date.getDay(); // 0(일요일) ~ 6(토요일)
      
      // 일요일이거나 공휴일인 경우
      if (dayOfWeek === 0 || isHoliday(date)) {
        return 'sunday-holiday';
      } 
      // 토요일인 경우
      else if (dayOfWeek === 6) {
        return 'saturday';
      }
      // 평일인 경우
      return 'weekday';
    },
    [isHoliday] // isHoliday 함수가 변경될 때만 재생성
  );

  // 달력의 모든 날짜 셀에 색상 클래스를 적용하는 함수
  const applyDateColors = React.useCallback(() => {
    // 컨테이너에서 FullCalendar DOM 요소 찾기
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    // 모든 날짜 셀 찾기
    const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((cell: Element) => {
      // 각 셀의 data-date 속성에서 날짜 정보 가져오기
      const dateAttr = cell.getAttribute('data-date');
      if (dateAttr) {
        const date = new Date(dateAttr);
        const colorClass = getDayColorClass(date);

        // 기존 색상 클래스들 제거
        cell.classList.remove('sunday-holiday', 'saturday', 'weekday');
        // 새로운 색상 클래스 추가
        cell.classList.add(colorClass);
      }
    });
  }, [getDayColorClass]);

  // 메모 텍스트영역 클릭 이벤트 핸들러
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

  // 날짜 셀 내용을 렌더링하는 함수
  const renderDayCellContent = React.useCallback(
    (dayInfo: any) => {
      // 사용자 정의 렌더링 함수가 있으면 그것을 사용
      if (dayCellContent) {
        return dayCellContent(dayInfo);
      }
      
      // 기본 렌더링: 날짜 숫자와 색상 클래스 적용
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

  // 달력에 메모 컬럼을 추가하는 함수
  const addMemoColumn = React.useCallback(() => {
    // FullCalendar DOM 요소 찾기
    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) return;

    // 모든 셀들의 너비를 8등분(12.5%)으로 설정
    const allCells = calendarEl.querySelectorAll(
      '.fc-col-header-cell, .fc-daygrid-day'
    );
    allCells.forEach((cell: Element) => {
      (cell as HTMLElement).style.width = '12.5%';
    });

    // 헤더 행에 메모 컬럼 헤더 추가
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

    // 각 주의 행에 메모 컬럼 바디 셀 추가
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

    // 모든 텍스트영역에 이벤트 리스너 추가
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

    // 달력 외부 클릭 시 모든 텍스트영역 포커스 해제
    const handleCalendarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // 클릭한 곳이 텍스트영역이 아니면
      if (!target.closest('.memo-textarea')) {
        const allTextareas =
          calendarEl.querySelectorAll('.memo-textarea') as NodeListOf<HTMLTextAreaElement>;
        allTextareas.forEach((textarea) => {
          textarea.blur(); // 포커스 해제
        });
      }
    };

    // 달력 클릭 이벤트 리스너 설정
    calendarEl.removeEventListener('click', handleCalendarClick);
    calendarEl.addEventListener('click', handleCalendarClick);
  }, []);

  // 달력 업데이트 함수 (메모 컬럼 추가 + 날짜 색상 적용)
  const updateCalendar = React.useCallback(() => {
    requestAnimationFrame(() => { // 다음 프레임에 실행 (DOM 업데이트 후)
      addMemoColumn();    // 메모 컬럼 추가
      applyDateColors();  // 날짜 색상 적용
    });
  }, [addMemoColumn, applyDateColors]);

  // FullCalendar 로딩 상태 변경 핸들러
  const handleLoading = (isLoading: boolean) => {
    if (!isLoading) {
      updateCalendar(); // 로딩 완료 시 달력 업데이트
    }
  };

  // FullCalendar 뷰 마운트 완료 핸들러
  const handleViewDidMount = () => {
    updateCalendar(); // 뷰 마운트 완료 시 달력 업데이트
  };

  // FullCalendar 날짜 범위 변경 핸들러
  const handleDatesSet = React.useCallback(
    (dateInfo: any) => {
      // 부모 컴포넌트의 콜백 함수 호출
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }

      // 현재 표시된 날짜 범위에서 중간 날짜 계산
      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);
      const middleDate = new Date(
        (startDate.getTime() + endDate.getTime()) / 2
      );
      const currentYear = middleDate.getFullYear().toString();

      // 해당 연도의 공휴일 데이터 로드
      loadHolidays(currentYear);
      // 달력 업데이트
      updateCalendar();
    },
    [onDatesSet, loadHolidays, updateCalendar]
  );

  // 컴포넌트 마운트 시 현재 연도의 공휴일 로드
  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    loadHolidays(currentYear);
  }, [loadHolidays]);

  // 공휴일 데이터 로드 완료 시 색상 적용
  useEffect(() => {
    if (!isLoadingHolidays && holidays.length > 0) {
      const timer = setTimeout(() => {
        applyDateColors(); // 0.2초 후 색상 적용
      }, 200);
      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [holidays.length, isLoadingHolidays, applyDateColors]);

  // 컴포넌트 렌더링
  return (
    <div className={`calendar-base ${className}`} ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}     // 사용할 플러그인들
        initialView={initialView}                        // 초기 뷰 모드
        headerToolbar={headerToolbar}                    // 헤더 툴바 설정
        height={height}                                  // 달력 높이
        events={events}                                  // 표시할 이벤트들
        editable={editable}                              // 편집 가능 여부
        selectable={selectable}                          // 선택 가능 여부
        selectMirror={true}                              // 선택 시 미리보기 표시
        dayMaxEvents={3}                                 // 하루 최대 이벤트 수
        weekends={weekends}                              // 주말 표시 여부
        locale={locale}                                  // 언어 설정
        businessHours={businessHours}                    // 업무 시간
        select={onDateSelect}                            // 날짜 선택 콜백
        eventClick={onEventClick}                        // 이벤트 클릭 콜백
        eventDrop={onEventDrop}                          // 이벤트 드래그 콜백
        eventResize={onEventResize}                      // 이벤트 리사이즈 콜백
        datesSet={handleDatesSet}                        // 날짜 범위 변경 콜백
        viewDidMount={handleViewDidMount}                // 뷰 마운트 콜백
        loading={handleLoading}                          // 로딩 상태 변경 콜백
        eventContent={eventContent}                      // 사용자 정의 이벤트 렌더링
        dayCellContent={renderDayCellContent}            // 사용자 정의 날짜 셀 렌더링
        eventDisplay="block"                             // 이벤트 표시 방식
        dayMaxEventRows={3}                              // 하루 최대 이벤트 행 수
        moreLinkClick="popover"                          // "더보기" 링크 클릭 시 팝오버
        timeZone="Asia/Seoul"                            // 시간대 설정
        dayHeaderFormat={{ weekday: 'short' }}           // 요일 헤더 형식
        titleFormat={{ year: 'numeric', month: 'long' }} // 제목 형식
      />
    </div>
  );
};

export default CalendarBase;