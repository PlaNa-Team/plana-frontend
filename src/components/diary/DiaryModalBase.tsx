import React, { useEffect, useRef, useState } from 'react';
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
        currentDiaryDetail,
        isLoading,
        isUploading,
        error
    } = useAppSelector(state => state.diary);

    const modalContentRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');
    const [isSaving, setIsSaving] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false);

    useEffect(() => {
        if (diaryData && diaryData.diaryType) {
            setActiveTab(diaryData.diaryType);
            dispatch(clearCurrentData());

            // 상세 조회 api 로직
        }
    }, [diaryData, dispatch]);

    const handleToastClose = (open: boolean) => {
        if (!open) {
            dispatch(clearError());
            setIsToastOpen(false);
        }
    };

    const handleSaveDiary = () => {
        if (!selectedDate) {
            toast.error('날짜를 선택해 주세요.');
            return;
        }

        let content: DailyContent | MovieContentType | BookContentType;
        switch (activeTab) {
            case 'DAILY':
                content = currentMomentData;
                break;
            case 'MOVIE':
                content = currentMovieData;
                break;
            case 'BOOK':
                content = currentBookData;
                break;
            default:
                return;
        }
    }

    // 모달 외부 클릭을 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // modalContentRef가 설정되어 있고, 클릭한 대상이 모달 외부인 경우
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // 모달이 열려 있을 때만 이벤트 리스너 추가
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

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

    const handleCloseModal = () => {
        dispatch(clearCurrentData());
        dispatch(clearError());
        onClose();
    }

    const handleTabChange = (tab: DiaryType) => {
        setActiveTab(tab);
    }

    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleCloseModal}>
            <div className='diary-modal' ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
                <div className='diary-modal-header'>
                    <button 
                        className='diary-modal-close'
                        onClick={handleCloseModal} 
                        disabled={isLoading}
                    >
                        <XIcon width='24' height='24' fill='var(--color-xl)' />
                    </button>
                    <button 
                        className='diary-modal-save'
                        disabled={isLoading || isUploading}
                    >
                        <CheckIcon width='24' height='24' fill='var(--color-xl)' />
                    </button>
                </div>

                <div className='diary-modal-main'>
                    <div className='diary-modal-sidebar'>
                        <button
                            className={`diary-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                            onClick={() => handleTabChange('DAILY')}
                        >
                            <span className='diary-tab-text'>
                                D<br/>A<br/>I<br/>L<br/>Y
                            </span>
                        </button>
                        <button
                            className={`diary-tab ${activeTab === 'MOVIE' ? 'active' : ''}`}
                            onClick={() => handleTabChange('MOVIE')}
                        >
                            <span className='diary-tab-text'>
                                M<br/>O<br/>V<br/>I<br/>E
                            </span>
                        </button>
                        <button
                            className={`diary-tab ${activeTab === 'BOOK' ? 'active' : ''}`}
                            onClick={() => handleTabChange('BOOK')}
                        >
                            <span className='diary-tab-text'>
                                B<br/>O<br/>O<br/>K
                            </span>
                        </button>
                    </div>

                    <div className='tab-content'>
                        {activeTab === 'DAILY' && (
                            <MomentContent/>
                        )}
                        {activeTab === 'MOVIE' && (
                            <MovieContent/>
                        )}
                        {activeTab === 'BOOK' && (
                            <BookContent/>
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
                    description={error || '저장 성공'}
                    isOpen={!!error}
                    onOpenChange={handleToastClose}
                />
            </div>
        </div>
    );
};

export default DiaryModalBase;