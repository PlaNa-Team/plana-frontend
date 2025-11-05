import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    setSelectedDate,
    clearCurrentData,
    getMonthlyDiariesAsync,
    setCurrentViewMonthAndYear,
    getDiaryDetailWithLockAsync,
    releaseDiaryLockAsync
} from '../../store/slices/diarySlice';
import { MonthlyDiaryItem } from '../../types/diary.types';
import CustomDiaryCalendar from './CustomDiaryCalendar';
import DiaryModalBase from '../../components/diary/DiaryModalBase';
import toast from 'react-hot-toast';

const DiaryCalendar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { monthlyDiaries, selectedDate, currentViewMonthAndYear, isLoading } = useAppSelector(
        state => state.diary
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiaryData, setSelectedDiaryData] = useState<MonthlyDiaryItem | null>(null);

    const currentViewDate = useMemo(
        () => new Date(currentViewMonthAndYear.year, currentViewMonthAndYear.month - 1),
        [currentViewMonthAndYear]
    );

    const diaryMap = useMemo(() => {
        const map = new Map<string, MonthlyDiaryItem>();
        monthlyDiaries.forEach(diary => {
            const dateOnly = diary.diaryDate.split('T')[0];
            map.set(dateOnly, diary);
        });
        return map;
    }, [monthlyDiaries]);

    useEffect(() => {
        dispatch(getMonthlyDiariesAsync(currentViewMonthAndYear));
    }, [dispatch, currentViewMonthAndYear]);

    const handleDateClick = useCallback(
        async (dateStr: string) => {
            const diaryData = diaryMap.get(dateStr);

            try {
                if (diaryData) {
                    await dispatch(getDiaryDetailWithLockAsync(dateStr)).unwrap();
                } else {
                    dispatch(clearCurrentData());
                }
                dispatch(setSelectedDate(dateStr));
                setSelectedDiaryData(diaryData || null);
                setIsModalOpen(true);
            } catch {
                toast.error('다이어리 데이터를 불러오지 못했습니다.');
            }
        },
        [diaryMap, dispatch]
    );

    const handleCloseModal = useCallback(async () => {
        if (selectedDiaryData?.id) {
            await dispatch(releaseDiaryLockAsync(selectedDiaryData.id));
        }
        setIsModalOpen(false);
        dispatch(setSelectedDate(null));
        dispatch(clearCurrentData());
        setSelectedDiaryData(null);
    }, [dispatch, selectedDiaryData]);

    const handleMonthChange = useCallback(
        (newDate: Date) => {
            const newYear = newDate.getFullYear();
            const newMonth = newDate.getMonth() + 1;
            dispatch(setCurrentViewMonthAndYear({ year: newYear, month: newMonth }));
        },
        [dispatch]
    );

    return (
        <div className='diary-calendar-container'>
            {isLoading && (
                <div className='loading-overlay'>
                    <div className='loading-spinner'></div>
                </div>
            )}

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
                    diaryData={
                        selectedDiaryData
                            ? {
                                  id: selectedDiaryData.id,
                                  diaryType: selectedDiaryData.type, // ✅ type → diaryType
                                  imageUrl: selectedDiaryData.imageUrl || '', // ✅ optional → string
                                  title: selectedDiaryData.title,
                              }
                            : null
                    }
                />
            )}
        </div>
    );
};

export default DiaryCalendar;
