import React, { useState, useEffect } from 'react';
import { MonthlyDiaryItem } from '../../types';
import DiaryMemoCell from './DiaryMemoCell';

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
    const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
    const currentDate = externalCurrentDate || internalCurrentDate;

    useEffect(() => {
        if (externalCurrentDate) {
            setInternalCurrentDate(new Date(externalCurrentDate));
        }
    }, [externalCurrentDate]);

    const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const getWeekStart = (date: Date) => {
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    };

    const addMonths = (date: Date, months: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameMonth = (date1: Date, date2: Date) =>
        date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();

    const monthStart = getMonthStart(new Date(currentDate));
    const monthEnd = getMonthEnd(new Date(currentDate));
    const calendarStart = getWeekStart(new Date(monthStart));

    const generateCalendarDays = () => {
        const days: Date[] = [];
        const monthEndWeek = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);
        const totalDays = monthEndWeek * 7;
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(calendarStart);
            date.setDate(calendarStart.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    const getWeekOfYear = (date: Date): number => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const daysSince = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
        return Math.ceil((daysSince + firstDayOfYear.getDay() + 1) / 7);
    };

    const goToPrevMonth = () => {
        const newDate = addMonths(new Date(currentDate), -1);
        onMonthChange?.(newDate);
        setInternalCurrentDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = addMonths(new Date(currentDate), 1);
        onMonthChange?.(newDate);
        setInternalCurrentDate(newDate);
    };

    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);
        onDateClick(dateStr);
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토', '메모'];

    return (
        <div className='diary-calendar-wrapper'>
            <div className='calendar-header'>
                <button className='nav-btn prev-btn' onClick={goToPrevMonth}>
                    &lt;
                </button>
                <h2 className='calendar-title'>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <button className='nav-btn next-btn' onClick={goToNextMonth}>
                    &gt;
                </button>
            </div>

            <div className='calendar-grid'>
                {weekDays.map((day, index) => (
                    <div
                        key={day}
                        className={`${index === 7 ? 'memo-header' : 'weekday-header'} ${
                            index === 0
                                ? 'sunday'
                                : index === 6
                                ? 'saturday'
                                : index === 7
                                ? ''
                                : 'weekday'
                        }`}
                    >
                        {day}
                    </div>
                ))}

                {calendarDays.map((date, index) => {
                    const dateStr = formatDate(date);
                    const dayNumber = date.getDate();
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isTodayDate = isToday(date);
                    const hasDiary = diaryMap.get(dateStr);
                    const dayOfWeek = date.getDay();

                    const cellClasses = [
                        'date-cell',
                        !isCurrentMonth && 'other-month',
                        isTodayDate && 'today',
                        hasDiary && 'has-diary',
                        dayOfWeek === 0 && 'sunday',
                        dayOfWeek === 6 && 'saturday'
                    ]
                        .filter(Boolean)
                        .join(' ');

                    const isEndOfWeek = (index + 1) % 7 === 0;
                    const weekNumber = Math.floor(index / 7);

                    return [
                        <div
                            key={`date-${index}`}
                            className={cellClasses}
                            onClick={() => handleDateClick(date)}
                            data-date={dateStr}
                        >
                            <div className='date-number'>{dayNumber}</div>
                            {hasDiary && (
                                <div className='diary-img'>
                                    {hasDiary.imageUrl ? (
                                        <img src={hasDiary.imageUrl} className='diary-thumbnail' />
                                    ) : (
                                        <span className='diary-dot' />
                                    )}
                                </div>
                            )}
                        </div>,
                        isEndOfWeek && (
                            <div key={`memo-${weekNumber}`} className='memo-cell'>
                                <DiaryMemoCell
                                    year={currentDate.getFullYear()}
                                    month={currentDate.getMonth() + 1}
                                    week={getWeekOfYear(date)}
                                />
                            </div>
                        )
                    ].filter(Boolean);
                })}
            </div>
        </div>
    );
};

export default CustomDiaryCalendar;