// components/common/CalendarBase.tsx - 메모 기능 포함 뼈대
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectCurrentYear,
  selectCurrentMonth,
  selectWeeklyMemos,
  selectEditingWeek,
  selectMemoInputs,
  selectWeeksInCurrentMonth,
  startEditingMemo,
  updateMemoInput,
  saveMemo,
  cancelEditingMemo
} from '../../store/slices/calendarSlice';



interface CalendarBaseProps {
  // 이벤트 데이터
  events?: any[];
  
  // 이벤트 핸들러들
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (clickInfo: any) => void;
  onEventDrop?: (dropInfo: any) => void;
  onEventResize?: (resizeInfo: any) => void;
  onDatesSet?: (dateInfo: any) => void;
  
  // 캘린더 설정
  initialView?: string;
  headerToolbar?: any;
  height?: string | number;
  editable?: boolean;
  selectable?: boolean;
  
  // 커스텀 렌더링
  eventContent?: (eventInfo: any) => React.ReactElement | null;
  dayCellContent?: (dayInfo: any) => React.ReactElement | null;
  
  // 추가 설정
  locale?: string;
  weekends?: boolean;
  businessHours?: any;
  
  // 스타일 관련
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
  const dispatch = useAppDispatch();
  
  // Redux 상태 가져오기
  const currentYear = useAppSelector(selectCurrentYear);
  const currentMonth = useAppSelector(selectCurrentMonth);
  const weeklyMemos = useAppSelector(selectWeeklyMemos);
  const editingWeek = useAppSelector(selectEditingWeek);
  const memoInputs = useAppSelector(selectMemoInputs);
  const weeksInMonth = useAppSelector(selectWeeksInCurrentMonth);

  // 메모 편집 시작
  const handleStartEditing = (weekNumber: number) => {
    dispatch(startEditingMemo(weekNumber));
  };

  // 메모 입력 변경
  const handleMemoInputChange = (weekNumber: number, content: string) => {
    dispatch(updateMemoInput({ weekNumber, content }));
  };

  // 메모 저장
  const handleSaveMemo = (weekNumber: number) => {
    const content = memoInputs[weekNumber] || '';
    dispatch(saveMemo({ weekNumber, content }));
  };

  // 메모 편집 취소
  const handleCancelEditing = (weekNumber: number) => {
    dispatch(cancelEditingMemo(weekNumber));
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent, weekNumber: number) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveMemo(weekNumber);
    } else if (e.key === 'Escape') {
      handleCancelEditing(weekNumber);
    }
  };

  // 메모 컬럼 렌더링
  const renderMemoColumn = () => {
    return (
      <>
        {/* 메모 헤더 */}
        <div className="memo-header">
          메모
        </div>
        
        {/* 각 주차별 메모 칸 */}
        {Array.from({ length: weeksInMonth }, (_, index) => {
          const weekNumber = index + 1;
          const memoKey = `${currentYear}-${currentMonth}-${weekNumber}`;
          const existingMemo = weeklyMemos[memoKey] || '';
          const isEditing = editingWeek === weekNumber;
          const currentInput = memoInputs[weekNumber] || '';

          return (
            <div
              key={weekNumber}
              className={`memo-cell ${isEditing ? 'editing' : ''}`}
              onClick={!isEditing ? () => handleStartEditing(weekNumber) : undefined}
            >
              {isEditing ? (
                // 편집 모드
                <div className="memo-edit-mode">
                  <textarea
                    value={currentInput}
                    onChange={(e) => handleMemoInputChange(weekNumber, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, weekNumber)}
                    placeholder={`${currentMonth}월 ${weekNumber}주차 메모...`}
                    autoFocus
                    className="memo-textarea"
                  />
                  <div className="memo-buttons">
                    <button
                      onClick={() => handleSaveMemo(weekNumber)}
                      className="memo-save-btn"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => handleCancelEditing(weekNumber)}
                      className="memo-cancel-btn"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="memo-view-mode">
                  {existingMemo ? (
                    <div className="memo-content">
                      {existingMemo}
                    </div>
                  ) : (
                    <div className="memo-placeholder">
                      <div className="memo-plus">+</div>
                      <div>메모 추가</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={`calendar-base ${className}`}>
      <div className="calendar-container">
        {/* 메인 캘린더 */}
        <div className="calendar-main">
          <FullCalendar
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
            
            // 이벤트 핸들러들
            select={onDateSelect}
            eventClick={onEventClick}
            eventDrop={onEventDrop}
            eventResize={onEventResize}
            datesSet={onDatesSet}
            
            // 커스텀 렌더링
            eventContent={eventContent}
            dayCellContent={dayCellContent}
            
            // 기본 설정들
            eventDisplay="block"
            dayMaxEventRows={3}
            moreLinkClick="popover"
            timeZone="Asia/Seoul"
            dayHeaderFormat={{ weekday: 'short' }}
            titleFormat={{ year: 'numeric', month: 'long' }}
          />
        </div>
        
        {/* 메모 컬럼 (항상 표시) */}
        <div className="memo-column">
          {renderMemoColumn()}
        </div>
      </div>
    </div>
  );
};

export default CalendarBase;