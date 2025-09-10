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
import { HolidayItem, MemoItem, MemoPayload, UpdateMemoPayload } from '../../types/calendar.types';
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

  // 간단한 메모 컬럼 추가 함수
const addMemoColumn = React.useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;

    const calendarEl = containerRef.current?.querySelector('.fc');
    if (!calendarEl) {
        isUpdating.current = false;
        return;
    }

    // 기존 메모 셀 제거
    calendarEl.querySelectorAll('.memo-header-cell, .memo-body-cell').forEach(cell => cell.remove());

    // 셀 너비 조정
    calendarEl.querySelectorAll('.fc-col-header-cell, .fc-daygrid-day').forEach((cell: Element) => {
        (cell as HTMLElement).style.width = '12.5%';
    });

    // 메모 헤더 추가
    const headerRow = calendarEl.querySelector('.fc-col-header tr');
    if (headerRow) {
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

    // 현재 월 정보
    const currentDate = calendarRef.current?.getApi().getDate() || new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    const currentYear = currentDate.getFullYear();

    // ✅ 변경된 부분: API 호출 로직
    let monthlyMemos: MemoItem[] = [];
    try {
        // 월별 메모를 한 번에 조회하도록 수정 (year, month, type 파라미터 사용)
        monthlyMemos = await calendarAPI.getMonthlyMemos(currentYear, currentMonth, "스케줄");
    } catch (error) {
        console.error("월별 메모 조회 실패:", error);
        isUpdating.current = false;
        return;
    }
    
    // DOM 준비 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    const bodyRows = calendarEl.querySelectorAll('.fc-daygrid-body tr[role="row"]');

    // 처리된 주차 추적
    const processedWeeks = new Set<number>();

    // 각 주별 메모 셀 생성
    for (const row of Array.from(bodyRows)) {
        const dateCells = row.querySelectorAll('.fc-daygrid-day[data-date]');
        if (dateCells.length === 0) continue;

        let weekDate: Date | null = null;
        let hasRelevantDate = false;
        
        for (const cell of Array.from(dateCells)) { 
            const dateAttr = cell.getAttribute('data-date');
            if (dateAttr) {
                const cellDate = new Date(dateAttr);
                if (cellDate.getFullYear() === currentYear) {
                    if (cellDate.getMonth() + 1 === currentMonth ||
                        Math.abs((cellDate.getFullYear() * 12 + cellDate.getMonth()) - (currentYear * 12 + currentMonth - 1)) <= 1) {
                        hasRelevantDate = true;
                        if (!weekDate || cellDate.getMonth() + 1 === currentMonth) {
                            weekDate = cellDate;
                        }
                    }
                }
            }
        }

        if (!hasRelevantDate || !weekDate) continue;

        const weekNumber = getWeekNumber(weekDate);
        
        console.log(`처리할 주차: ${weekNumber} (기준 날짜: ${weekDate.toISOString().split('T')[0]})`);
        
        // 중복 방지
        if (processedWeeks.has(weekNumber)) {
            console.log(`주차 ${weekNumber} 이미 처리됨 - 건너뛰기`);
            continue;
        }
        processedWeeks.add(weekNumber);
        
        // ✅ 변경된 부분: 이미 조회한 데이터에서 찾기
        const existingMemo = monthlyMemos.find(memo => 
            memo.week === weekNumber && memo.year === currentYear
        ) || null;

        // 메모 셀 생성
        const memoBodyCell = document.createElement('td');
        memoBodyCell.className = 'fc-daygrid-day memo-body-cell';
        memoBodyCell.style.width = '12.5%';
        
        memoBodyCell.innerHTML = `
            <div class="fc-daygrid-day-frame">
                <div class="memo-content">
                    <textarea 
                        placeholder="텍스트를 입력하세요" 
                        class="memo-textarea"
                        data-memo-id="${existingMemo?.id || ''}"
                        data-week="${weekNumber}"
                        data-year="${currentYear}"
                    >${existingMemo?.content || ''}</textarea>
                </div>
            </div>
        `;
        row.appendChild(memoBodyCell);
    }

    // 이벤트 핸들러 설정
    const textareas = calendarEl.querySelectorAll('.memo-textarea');
    for (let i = 0; i < textareas.length; i++) {
        const textareaEl = textareas[i] as HTMLTextAreaElement;
        
        textareaEl.addEventListener('click', handleTextareaClick);
        textareaEl.addEventListener('focus', handleTextareaFocus);
        textareaEl.addEventListener('mousedown', handleTextareaMouseDown);

        // 간단한 저장 함수 - 중복 체크 강화
        const saveMemo = async () => {
            const content = textareaEl.value.trim();
            if (!content) return;

            const memoId = textareaEl.getAttribute('data-memo-id');
            const week = parseInt(textareaEl.getAttribute('data-week') || '1');
            const year = parseInt(textareaEl.getAttribute('data-year') || currentYear.toString());

            console.log(`메모 저장 시도 - 주차: ${week}, 연도: ${year}, ID: ${memoId || 'new'}, 내용: ${content}`);

            try {
                if (memoId && memoId !== '') {
                    // 기존 메모 수정
                    console.log('기존 메모 수정 시도');
                    await calendarAPI.updateMemo({
                        id: parseInt(memoId),
                        content,
                        type: '스케줄'
                    });
                    console.log('메모 수정 완료');
                } else {
                    // 새 메모 생성 전에 기존 메모 확인
                    console.log('새 메모 생성 전 중복 체크');
                    
                    // 서버에서 해당 주차 메모가 이미 있는지 확인
                    // 만약 중복 체크가 필요하면 여기서 먼저 조회
                    
                    const newMemo = await calendarAPI.createMemo({
                        content,
                        year,
                        week,
                        type: '스케줄'
                    });
                    console.log('메모 생성 완료:', newMemo);
                    
                    // 생성된 ID를 저장
                    textareaEl.setAttribute('data-memo-id', newMemo.id.toString());
                }
                
                // 성공 표시
                textareaEl.style.borderColor = '#4CAF50';
                setTimeout(() => {
                    textareaEl.style.borderColor = '';
                }, 1000);
            } catch (error) {
                console.error('메모 저장 실패:', error);
                
                // 에러 표시
                textareaEl.style.borderColor = '#f44336';
                setTimeout(() => {
                    textareaEl.style.borderColor = '';
                }, 2000);
            }
        };

        // 엔터키와 블러 이벤트
        textareaEl.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textareaEl.blur(); // 엔터키로 포커스 해제 -> blur 이벤트만 동작하도록 유도
        }
    });

        textareaEl.addEventListener('blur', saveMemo); // 포커스가 해제될 때만 저장
    }

    isUpdating.current = false;
}, [handleTextareaClick, handleTextareaFocus, handleTextareaMouseDown]);

  const updateCalendar = React.useCallback(() => {
    setTimeout(() => {
      addMemoColumn();
      applyDateColors();
    }, 100);
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
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }

      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);
      const middleDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
      
      const currentYear = middleDate.getFullYear();
      const currentMonth = middleDate.getMonth() + 1;

      // 월 변경시 플래그 리셋
      isUpdating.current = false;

      loadHolidays(currentYear.toString());
      updateCalendar();

      try {
        dispatch(updateCurrentDate({ start: dateInfo.startStr }));
        await dispatch(fetchMonthlySchedules({ year: currentYear, month: currentMonth })).unwrap();
      } catch (error) {
        console.error('일정 로드 실패:', error);
      }
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
    
    console.log('=== 초기 로드 fetchMonthlySchedules API 요청 ===');
    console.log('year:', year, 'type:', typeof year);
    console.log('month:', month, 'type:', typeof month);
    console.log('전체 파라미터:', { year, month });
    
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