import React, { useCallback } from 'react'
import CalendarBase from '../../components/ui/CalendarBase';
import { createEntityAdapter } from '@reduxjs/toolkit';

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
            diaryDate: '2023-10-01',
            diaryType: 'DAILY',
            imageUrl: 'https://example.com/image1.jpg',
            title: 'My first diary entry'
        },
        {
            id: 2,
            diaryDate: '2023-10-02',
            diaryType: 'BOOK',
            imageUrl: 'https://example.com/image2.jpg',
            title: 'Book review'
        },
        {
            id: 3,
            diaryDate: '2023-10-03',
            diaryType: 'MOVIE',
            imageUrl: 'https://example.com/image3.jpg',
            title: 'Movie thoughts'
        }
    ];

    // 날짜별 다이어리 매핑
    const diaryMap = React.useMemo(() => {
        const map = new Map<string, DiaryCalendarProps>();
        DiaryData.forEach(prop => {
            map.set(prop.diaryDate, prop);
        });
        return map;
    }, [DiaryData]);

    // 날짜 클릭 핸들러
    const handleDateClcik = useCallback((date: string) => {
        
    }, []);

    // 커스텀 날짜 셀 랜더링
    const renderDayCellContent = useCallback((dayInfo: any) => {
        const dateStr = dayInfo.date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
        const dayNumber = dayInfo.date.getDate();
        const diaryData = diaryMap.get(dateStr);

        // 다이어리 데이터가 있는 경우
        if (diaryData) {
            return (
                <div className="diary-day-cell">
                    <div className="diary-image-container">
                        <img
                            src={diaryData.imageUrl}
                            alt={`${dateStr} 다이어리`}
                            className="diary-image"
                        />
                        <div className="diary-date-overlay">
                            {dayNumber}
                        </div>
                    </div>
                </div>
            );
        }

        // 다이어리 데이터가 없는 경우
        return (
            <div className="diary-day-cell empty">
                <div className='diary-empty-content'>
                    <div className="diary-date-number">
                        {dayNumber}
                    </div>
                </div>
            </div>
        );
    }, [diaryMap]);

  return (
    <div className="diary-calendar-container">
        <CalendarBase
            className="diary-calendar"
            onDateClick={handleDateClcik}
            dayCellContent={renderDayCellContent}
            headerToolbar={{
                left: 'prev',
                center: 'title',
                right: 'next'
            }}
            height="auto"
            selectable= {true}
            editable= {false}
        />
    </div>
  )
}

export default DiaryCalendar;