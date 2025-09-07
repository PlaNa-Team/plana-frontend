import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
    setSelectedDate,
    clearCurrentData,
} from '../../store/slices/diarySlice';
import { MonthlyDiaryItem } from '../../types/diary.types';
import CustomDiaryCalendar from './CustomDiaryCalendar';
import DiaryModalBase from '../../components/diary/DiaryModalBase';

const DiaryCalendar: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        monthlyDiaries,
        selectedDate,
        isLoading,
        error
    } = useAppSelector(state => state.diary);

    // 지역 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiaryData, setSelectedDiaryData] = useState<any>(null);
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    // 날짜별 다이어리 매핑
    const diaryMap = useMemo(() => {
        const map = new Map<string, MonthlyDiaryItem>();
        monthlyDiaries.forEach(diary => {
            map.set(diary.diaryDate, diary);
        });
        return map;
    }, [monthlyDiaries]);

    // 날짜 클릭 핸들러
    const handleDateClick = useCallback(async (dateStr: string) => {
        const diaryData = diaryMap.get(dateStr);

        // Redux에 선택된 날짜 저장
        dispatch(setSelectedDate(dateStr));
        setSelectedDiaryData(diaryData);

        setIsModalOpen(true);
    }, [diaryMap, dispatch]);

    // 모달 닫기 핸들러
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        dispatch(setSelectedDate(null));
        dispatch(clearCurrentData());
        setSelectedDiaryData(null);
    }, [dispatch]);

    const handleMonthChange = useCallback((newDate: Date) => {
        setCurrentViewDate(newDate);
    }, []);

    return (
        <div className="diary-calendar-container">
            {/* 로딩 상태 표시 */}
            {/* { isLoading && ( */}
                <div className='loading-overlay'>
                    <div className='loading-spinner'></div>
                </div>
            {/* )} */}

            <CustomDiaryCalendar 
                diaryMap={diaryMap}
                onDateClick={handleDateClick}
                onMonthChange={handleMonthChange}
                currentDate={currentViewDate}
            />
            
            {isModalOpen && (
                <DiaryModalBase
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    selectedDate={selectedDate}
                    diaryData={selectedDiaryData}
                />
            )}
        </div>
    );
};

export default DiaryCalendar;