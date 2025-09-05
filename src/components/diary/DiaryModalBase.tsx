import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon, TrashBinIcon } from '../../assets/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import {
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    clearError,
} from '../../store/slices/diarySlice';
import {
    CreateDiaryRequest,
    UpdateDiaryRequest,
    DailyContent,
    MovieContent as MovieContentType, // 이름 중복 해결을 위해 별칭 추가
    BookContent as BookContentType,
} from '../../types/diary.types';
import CustomToast from '../ui/Toast';
import MomentContent from './MomentContent';
import MovieContent from './MovieContent';
import BookContent from './BookContent';
import toast from 'react-hot-toast';

export type DiaryType = 'DAILY' | 'BOOK' | 'MOVIE';

interface DiaryModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    diaryData?: {
        id: number;
        diaryType: DiaryType;
        imageUrl: string;
        title: string;
    } | null;
}

const DiaryModalBase: React.FC<DiaryModalBaseProps> = ({
    isOpen,
    onClose,
    selectedDate,
    diaryData
}) => {
    const dispatch = useAppDispatch();
    const {
        currentMomentData,
        currentMovieData,
        currentBookData,
        tempImageUrl,
        currentDiaryDetail,
        isLoading,
        isUploading,
        error
    } = useAppSelector(state => state.diary);

    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    // 다이어리 상세 데이터가 로드되면 Redux 상태 업데이트
    useEffect(() => {
        if (currentDiaryDetail) {
            const content = currentDiaryDetail.content;
            if (currentDiaryDetail.diaryType === 'DAILY') {
                dispatch(updateMomentData(content as DailyContent));
            } else if (currentDiaryDetail.diaryType === 'BOOK') {
                dispatch(updateBookData(content as BookContentType));
            } else if (currentDiaryDetail.diaryType === 'MOVIE') {
                dispatch(updateMovieData(content as MovieContentType));
            }
            setActiveTab(currentDiaryDetail.diaryType);
        }
    }, [currentDiaryDetail, dispatch]);

    const handleTabChange = (type: DiaryType) => {
        setActiveTab(type);
        dispatch(clearCurrentData());
    }

    const handleToastClose = () => {
        dispatch(clearError());
    };

    if (!isOpen) return null;

    return (
        <div className={`diary-modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className='diary-modal-base'>
                <div className='diary-modal-header'>
                    <span className='date-label'>
                        {currentDiaryDetail?.diaryDate || selectedDate}
                    </span>
                    <div className='modal-actions'>
                        <button disabled={isLoading || isUploading}>
                            <CheckIcon width='24' height='24' fill='var(--color-primary)' />
                        </button>
                        <button onClick={onClose} disabled={isLoading}>
                            <XIcon width='24' height='24' fill='var(--color-primary)' />
                        </button>
                    </div>
                </div>

                <div className='diary-modal-content'>
                    <div className='diary-type-tabs'>
                        {['DAILY', 'BOOK', 'MOVIE'].map(type => (
                            <button
                                key={type}
                                className={`tab-button ${activeTab === type ? 'active' : ''}`}
                                onClick={() => setActiveTab(type as DiaryType)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className='tab-content'>
                        {activeTab === 'DAILY' && (
                            <MomentContent
                                imagePreview={currentDiaryDetail?.imageUrl || tempImageUrl || ''}
                            />
                        )}
                        {activeTab === 'MOVIE' && (
                            <MovieContent
                                imagePreview={currentDiaryDetail?.imageUrl || tempImageUrl || ''}
                            />
                        )}
                        {activeTab === 'BOOK' && (
                            <BookContent
                                imagePreview={currentDiaryDetail?.imageUrl || tempImageUrl || ''}
                            />
                        )}
                    </div>
                </div>
                
                {diaryData?.id && (
                    <button
                        className="diary-modal-delete"
                        disabled={isLoading}
                    >
                        <TrashBinIcon className="diary-modal-delete-icon" fill="var(--color-xl)" />
                    </button>
                )}

                {(isLoading || isUploading) && (
                    <div className='loading-overlay'>
                        <div className='loading-spinner'>
                            {isUploading ? '이미지 업로드 중...' : '로딩 중...'}
                        </div>
                    </div>
                )}

                <CustomToast
                    title={error ? '오류 발생' : '알림'}
                    description={error || (isUploading ? '이미지 업로드 성공' : '저장 성공')}
                    isOpen={!!error || (isUploading && tempImageUrl !== null)}
                    onOpenChange={handleToastClose}
                />
            </div>

            {(isLoading || isUploading) && (
                <div className='loading-overlay'>
                    <div className='loading-spinner'>
                        {isUploading ? '이미지 업로드 중...' : '로딩 중...'}    
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiaryModalBase;