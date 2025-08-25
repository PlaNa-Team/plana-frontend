import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
    fetchMonthlyDiaries,
    fetchDiaryDetail,
    setSelectedDate,
    clearCurrentData,
    loadDiaryToEdit
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
    const [selectedDiaryData, setSelectedDiaryData] = useState<any>(null);
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    const isModalOpen = selectedDate !== null;

    // 현재 보고있는 연월 기준 다이어리 데이터 가져오기
    // useEffect(() => {
    //     const year = currentViewDate.getFullYear();
    //     const month = currentViewDate.getMonth() + 1;
    //     dispatch(fetchMonthlyDiaries({ year, month }));
    // }, [dispatch, currentViewDate]);

    // 날짜별 다이어리 매핑
    const diaryMap = useMemo(() => {
        const map = new Map<string, MonthlyDiaryItem>();
        monthlyDiaries.forEach(diary => {
            map.set(diary.diaryDate, diary);
        });
        return map;
    // }, [monthlyDiaries]);
    }, []);

    // 날짜 클릭 핸들러
    const handleDateClick = useCallback(async (dateStr: string) => {
        const diaryData = diaryMap.get(dateStr);

        // Redux에 선택된 날짜 저장
        dispatch(setSelectedDate(dateStr));

        if (diaryData) {
            // 다이어리 데이터가 있으면 상세 정보 가져오기
            // try {
            //     await dispatch(fetchDiaryDetail(diaryData.id)).unwrap();
            //     // 가져온 데이터를 편집용으로 로드
            //     dispatch(loadDiaryToEdit());

                // 모달에 전달할 데이터 구성
                setSelectedDiaryData({
                    id: diaryData.id,
                    diaryType: diaryData.diaryType,
                    diaryDate: diaryData.diaryDate,
                    imageUrl: diaryData.imageUrl,
                    title: diaryData.title,
                });
            // } catch (error) {
            //     console.error('다이어리 상세 조회 실패:', error);
            //     setSelectedDiaryData(null);
            // }
        } else {
            // 다이어리 데이터가 없으면 새 다이어리 생성 모드
            dispatch(clearCurrentData());
            setSelectedDiaryData(null);
        }
    }, [diaryMap, dispatch]);

    // 모달 닫기 핸들러
    const handleCloseModal = useCallback(() => {
        setSelectedDate(null);
        dispatch(clearCurrentData());
        dispatch(setSelectedDate(null)); // 이걸로 모달이 닫힘
    }, [dispatch]);

    // 달력 월 변경 핸들러
    const handleMonthChange = useCallback((newDate: Date) => {
        setCurrentViewDate(newDate);

        // 월 변경 시 모달이 열려있다면 닫기
        if (selectedDate) {
            dispatch(setSelectedDate(null));
            setSelectedDiaryData(null);
        }
    }, [selectedDate, dispatch]);

    // 에러 처리
    // if (error) {
    //     return (
    //         <div className="diary-calendar-container">
    //             <div className="error-message">
    //                 <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
    //                 <button onClick={() => window.location.reload()}>
    //                     다시 시도
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

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