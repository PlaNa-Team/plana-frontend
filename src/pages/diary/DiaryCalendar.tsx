import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
    setSelectedDate,
    clearCurrentData,
    getMonthlyDiariesAsync,
    setCurrentViewMonthAndYear,
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
        error,
        currentViewMonthAndYear,
    } = useAppSelector(state => state.diary);

    // 지역 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiaryData, setSelectedDiaryData] = useState<any>(null);

    // Redux 상태 사용
    const currentViewDate = useMemo(() => new Date(currentViewMonthAndYear.year, currentViewMonthAndYear.month - 1), [currentViewMonthAndYear]);

    // 날짜별 다이어리 매핑
    const diaryMap = useMemo(() => {
        const map = new Map<string, MonthlyDiaryItem>();
        monthlyDiaries.forEach(diary => {
            const dateOnly = diary.diaryDate.split('T')[0];
            map.set(dateOnly, diary);
        });
        return map;
    }, [monthlyDiaries]);

    // 월별 다이어리 데이터 조회
    useEffect(() => {
        dispatch(getMonthlyDiariesAsync(currentViewMonthAndYear));
    }, [dispatch, currentViewMonthAndYear]);

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
    }, [dispatch, currentViewMonthAndYear]);

    // 월 변경 핸들러
    const handleMonthChange = useCallback((newDate: Date) => {
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        dispatch(setCurrentViewMonthAndYear({ year: newYear, month: newMonth }));
    }, [dispatch]);

    return (
        <div className="diary-calendar-container">
            {/* 로딩 상태 표시 */}
            {/* { isLoading && ( */}
                <div className='loading-overlay'>
                    <div className='loading-spinner'></div>
                </div>

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