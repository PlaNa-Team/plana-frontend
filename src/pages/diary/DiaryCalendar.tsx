import React, { useCallback, useState } from 'react'
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
            diaryDate: '2025-07-01',
            diaryType: 'DAILY',
            imageUrl: '/images/temp1.png',
            title: 'My first diary entry'
        },
        {
            id: 2,
            diaryDate: '2025-07-02',
            diaryType: 'BOOK',
            imageUrl: '/images/temp2.png',
            title: 'Book review'
        },
        {
            id: 3,
            diaryDate: '2025-07-03',
            diaryType: 'MOVIE',
            imageUrl: '/images/temp3.jpg',
            title: 'Movie thoughts'
        }
    ];

    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ selectedDate, setSelectedDate ] = useState<string | null>(null);
    const [ selectedDiaryData, setSelectedDiaryData ] = useState<DiaryCalendarProps | null>(null);

    // 날짜별 다이어리 매핑
    const diaryMap = React.useMemo(() => {
        const map = new Map<string, DiaryCalendarProps>();
        DiaryData.forEach(prop => {
            map.set(prop.diaryDate, prop);
        });
        return map;
    }, [DiaryData]);

    // 날짜 클릭 핸들러
    const handleDateClick = useCallback((date: string) => {
        const diaryData = diaryMap.get(date);
        setSelectedDate(date);
        setSelectedDiaryData(diaryData || null);
        setIsModalOpen(true);
    }, [diaryMap]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedDiaryData(null);
    }, []);

    // 커스텀 날짜 셀 랜더링
    const renderDayCellContent = useCallback((dayInfo: any) => {
        const dateStr = dayInfo.date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
        const dayNumber = dayInfo.date.getDate();
        const diaryData = diaryMap.get(dateStr);

        // 클릭 핸들러를 각 셀에 직접 추가
        const handleCellClick = () => {
            handleDateClick(dateStr);
        };

        // 다이어리 데이터가 있는 경우
        if (diaryData) {
            return (
                <div className="diary-day-cell" onClick={handleCellClick}>
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
            <div className="diary-day-cell empty" onClick={handleCellClick}>
                <div className='diary-empty-content'>
                    <div className="diary-date-number">
                        {dayNumber}
                    </div>
                </div>
            </div>
        );
    }, [diaryMap, handleDateClick]);

  return (
    <div className="diary-calendar-container">
        <CalendarBase
            className="diary-calendar"
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
        <DiaryModalBase
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            selectedDate={selectedDate}
            diaryData={selectedDiaryData}
        />
    </div>
  )
}

export default DiaryCalendar;