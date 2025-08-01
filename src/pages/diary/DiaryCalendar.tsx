import React, { useCallback, useEffect, useState } from 'react'
import CalendarBase from '../../components/ui/CalendarBase';
import { createEntityAdapter } from '@reduxjs/toolkit';
import DiaryModalBase from '../../components/diary/DiaryModalBase';

interface DiaryCalendarProps {
    id: number;
    diaryDate: string; //YYYY-MM-DD format
    diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
    imageUrl: string;
    title: string;
}

const DiaryCalendar: React.FC = () => {
    const DiaryData: DiaryCalendarProps[] = [
        {
            id: 1,
            diaryDate: '2025-08-01',
            diaryType: 'DAILY',
            imageUrl: '/images/temp1.png',
            title: 'My first diary entry'
        },
        {
            id: 2,
            diaryDate: '2025-08-02',
            diaryType: 'BOOK',
            imageUrl: '/images/temp2.png',
            title: 'Book review'
        },
        {
            id: 3,
            diaryDate: '2025-08-03',
            diaryType: 'MOVIE',
            imageUrl: '/images/temp3.jpg',
            title: 'Movie thoughts'
        }
    ];

    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ selectedDate, setSelectedDate ] = useState<string | null>(null);
    const [ selectedDiaryDate, setSelectedDiaryDate ] = useState<DiaryCalendarProps | null>(null);

    // 날짜별 다이어리 매핑
    const diaryMap = React.useMemo(() => {
        const map = new Map<string, DiaryCalendarProps>();
        DiaryData.forEach(prop => {
            map.set(prop.diaryDate, prop);
        });
        return map;
    }, [DiaryData]);

    useEffect(() => {
        const handleCalendarDateClick = (e: CustomEvent) => {
            const dateStr = e.detail.dateStr;
            const diaryData = diaryMap.get(dateStr);
            setSelectedDate(dateStr);
            setSelectedDiaryDate(diaryData || null);
            setIsModalOpen(true);
        };

        // 커스텀 이벤트 리스너
        window.addEventListener('calendar-date-click', handleCalendarDateClick as EventListener)

        return () => {
            window.removeEventListener('calendar-date-click', handleCalendarDateClick as EventListener)
        };
    }, [diaryMap]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedDiaryDate(null);
    }, []);

    // 커스텀 날짜 셀 랜더링
    const renderDayCellContent = useCallback((dayInfo: any) => {
        const dateStr = dayInfo.date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
        const dayNumber = dayInfo.date.getDate();
        const diaryData = diaryMap.get(dateStr);

        const dayOfWeek = dayInfo.date.getDay();
        let colorClass = 'weekday';
        if (dayOfWeek === 0) {
            colorClass = 'sunday-holiday';
        } else if (dayOfWeek === 6) {
            colorClass = 'saturday';
        }

        // 다이어리 데이터가 있는 경우
        if (diaryData) {
            return (
                <div className="diary-day-cell">
                    <div className="diary-image-container">
                        <img
                            src={ diaryData.imageUrl }
                            alt={`${dateStr} 다이어리`}
                            className="diary-image"
                        />
                        <div className={`diary-date-overlay ${colorClass}`}>
                            { dayNumber }
                        </div>
                    </div>
                </div>
            );
        }

        // 다이어리 데이터가 없는 경우
        return (
            <div className="diary-day-cell empty">
                <div className='diary-empty-content'>
                    <div className={`diary-date-number ${colorClass}`}>
                        { dayNumber }
                    </div>
                </div>
            </div>
        );
    }, [diaryMap]);

  return (
    <div className="diary-calendar-container">
        <CalendarBase
            className="diary-calendar"
            dayCellContent={ renderDayCellContent }
            headerToolbar={{
                left: 'prev',
                center: 'title',
                right: 'next'
            }}
            height="auto"
            selectable= {true}
            editable= {false}
        />
        <DiaryModalBase
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            selectedDate={selectedDate}
            diaryData={selectedDiaryDate}
        />
    </div>
  )
}

export default DiaryCalendar;