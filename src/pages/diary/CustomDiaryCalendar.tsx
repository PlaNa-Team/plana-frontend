import React, { useState, useEffect } from 'react';
import { MonthlyDiaryItem } from '../../types';

interface CustomDiaryCalendarProps {
    diaryMap: Map<string, MonthlyDiaryItem>;
    onDateClick: (dateStr: string) => void;
    onMonthChange?: (date: Date) => void;
    currentDate?: Date;
}

const CustomDiaryCalendar: React.FC<CustomDiaryCalendarProps> = ({
    diaryMap,
    onDateClick,
    onMonthChange,
    currentDate: externalCurrentDate
}) => {
    // 외부에서 currentDate를 받으면 해당 값을 사용하고, 아니면 내부 상태 사용
    const [ internalCurrentDate, setInternalCurrentDate ] = useState(new Date());
    const currentDate = externalCurrentDate || internalCurrentDate;

    // 외부에서 currentDate 변경 시 내부 상태 업데이트
    useEffect(() => {
        if (externalCurrentDate) {
            setInternalCurrentDate(new Date(externalCurrentDate));
        }
    }, [externalCurrentDate]);

    // 특정 월의 첫 번째 날 / 마지막 날 구하기 (1일 / 28일~31일)
    const getMonthStart = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getMonthEnd = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    // 특정 날짜가 속한 주의 일요일 구하기
    const getWeekStart = (date: Date) => {
        const day = date.getDay();
        const diff = date.getDate() - day; // 현재 날짜에서 일요일까지의 차이
        return new Date(date.setDate(diff));
    };

    // 월 단위로 날짜 더하기 / 빼기
    const addMonths = (date: Date, months: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    };

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 오늘 날짜인지 확인
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // 같은 월인지 확인 (현재 보고있는 월과 비교)
    const isSameMonth = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
    };

    // 달력 날짜 계산
    // 현재 월의 시작일과 마지막일
    const monthStart = getMonthStart(new Date(currentDate));
    const monthEnd = getMonthEnd(new Date(currentDate));

    // 달력 첫 번째 셀에 표시할 날짜 (월 시작일이 속한 주의 일주일)
    const calendarStart = getWeekStart(new Date(monthStart));

    // 달력에 표시할 모든 날짜 배열 생성 (6주)
    const generateCalendarDays = () => {
        const days = [];
        const start = new Date(calendarStart);

        // 현재 달의 마지막 날짜가 포함된 주까지만 계산
        const monthEndWeek = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);
        const totalDays = monthEndWeek * 7;

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    // 해당 주차가 1년 기준 몇 번째 주인지 계산
    const getWeekOfYear = (date: Date): number => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
        return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
    };

    // 메모 상태관리
    const [ memoData, setMemoData ] = useState<Map<number, string>>(new Map());
    const handleMemoChange = (weekOfYear: number, content: string) => {
        setMemoData(prev => {
            const newMap = new Map(prev);
            newMap.set(weekOfYear, content);
            return newMap;
        });
    }

    // 이벤트 핸들러들
    // 이전 달로 이동
    const goToPrevMonth = () => {
        const newDate = addMonths(new Date(currentDate), -1);
        if (externalCurrentDate && onMonthChange) {
            onMonthChange(newDate);
        } else {
            setInternalCurrentDate(newDate);
        }
    };

    // 다음 달로 이동
    const goToNextMonth = () => {
        const newDate = addMonths(new Date(currentDate), 1);
        if (externalCurrentDate && onMonthChange) {
            onMonthChange(newDate);
        } else {
            setInternalCurrentDate(newDate);
        }
    };

    // 날짜 셀 클릭 핸들러
    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);
        onDateClick(dateStr);
    };

    // 데이터
    const weekDays = [
        '일', '월', '화', '수', '목', '금', '토', '메모'
    ];

    return (
        <div className='diary-calendar-wrapper'>
            <div className='calendar-header'>
                <button
                    className='nav-btn prev-btn'
                    onClick={ goToPrevMonth }
                >
                    &lt;
                </button>
                <h2 className='calendar-title'>
                    { currentDate.getFullYear() }년 { currentDate.getMonth() + 1 }월
                </h2>
                <button
                    className='nav-btn next-btn'
                    onClick={ goToNextMonth }
                >
                    &gt;
                </button>
            </div>

            {/* 달력 그리드 */}
            <div className='calendar-grid'>
                {/* 요일 헤더 랜더링 */}
                { weekDays.map((day, index) => (
                    <div
                        key={ day }
                        className={`${index === 7 ? 'memo-header' : 'weekday-header'} ${
                            index === 0 ? 'sunday' : 
                            index === 6 ? 'saturday' : 
                            index === 7 ? '' : 'weekday'
                        }`}
                    >
                        { day }
                    </div>
                ))}

                {/* 날짜 셀 */}
                { calendarDays.map(( date, index ) => {
                    // 각 날짜 셀에 필요한 데이터 계산
                    const dateStr = formatDate(date); // YYYY-MM-DD 형식
                    const dayNumber = date.getDate();
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isTodayDate = isToday(date);
                    const hasDiary = diaryMap.get(dateStr);
                    const dayOfWeek = date.getDay();

                    // CSS 클래스명 동적 생성
                    const cellClasses = [
                        'date-cell',
                        !isCurrentMonth && 'other-month',
                        isTodayDate && 'today',
                        hasDiary && 'has-diary',
                        dayOfWeek === 0 && 'sunday',
                        dayOfWeek === 6 && 'saturday'
                    ].filter(Boolean).join(' ');

                    const isEndOfWeek = (index + 1) % 7 === 0;
                    const weekNumber = Math.floor(index / 7);

                    return [
                        // 날짜 셀
                        <div
                            key={`date-${index}`}
                            className={cellClasses}
                            onClick={() => handleDateClick(date)}
                            data-date={dateStr}
                        >
                            <div className='date-number'>
                                {dayNumber}
                            </div>
                            {hasDiary && (
                                <div className='diary-img'>
                                    <img
                                        src={hasDiary.imageUrl}
                                        alt={`${dateStr} 다이어리`}
                                        className='diary-thumbnail'
                                    />
                                </div>
                            )}
                        </div>,
                        
                        // 주 끝에 메모 셀 추가
                        isEndOfWeek && (
                            <div key={`memo-${weekNumber}`} className="memo-cell">
                                <textarea 
                                    className="memo-textarea"
                                    placeholder="메모를 입력하세요"
                                    value={memoData.get(getWeekOfYear(date)) || ''}
                                    onChange={(e) => handleMemoChange(getWeekOfYear(date), e.target.value)}
                                />
                            </div>
                        )
                    ].filter(Boolean); // false 값 제거
                })}
            </div>
        </div>
    )
}

export default CustomDiaryCalendar;