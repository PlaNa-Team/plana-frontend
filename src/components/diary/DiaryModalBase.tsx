import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckIcon, XIcon, TrashBinIcon } from '../../assets/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import {
    clearCurrentData,
    updateMomentData,
    updateMovieData,
    updateBookData,
    clearError,
    createDiaryAsync,
} from '../../store/slices/diarySlice';
import {
    CreateDiaryRequest,
    DailyContent,
    MovieContent as MovieContentType,
    BookContent as BookContentType,
} from '../../types/diary.types';
import MomentContent from './MomentContent';
import MovieContent from './MovieContent';
import BookContent from './BookContent';
import toast from 'react-hot-toast';
import { unwrapResult } from '@reduxjs/toolkit';

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
    diaryData,
}) => {
    const dispatch = useAppDispatch();
    const {
        currentMomentData,
        currentMovieData,
        currentBookData,
        isLoading,
        isUploading,
        error,
    } = useAppSelector(state => state.diary);

    const modalContentRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    const handleCloseModal = useCallback(() => {
        dispatch(clearCurrentData());
        dispatch(clearError());
        onClose();
    }, [dispatch, onClose]);

    const handleSave = useCallback(async () => {
        if (!selectedDate) {
            toast.error('날짜를 선택해 주세요.');
            return;
        }

        let content;
        let imageUrl;

        switch (activeTab) {
            case 'DAILY':
                content = { ...currentMomentData };
                imageUrl = currentMomentData.imageUrl;
                break;
            case 'MOVIE':
                content = { ...currentMovieData };
                imageUrl = currentMovieData.imageUrl;
                break;
            case 'BOOK':
                content = { ...currentBookData };
                imageUrl = currentBookData.imageUrl;
                break;
            default:
                return;
        }

        const requestBody: CreateDiaryRequest = {
            diaryDate: selectedDate,
            diaryType: activeTab,
            imageUrl: imageUrl || '',
            content,
            diaryTags: [],
        };

        try {
            const resultAction = await dispatch(createDiaryAsync({ diaryData: requestBody }));
            unwrapResult(resultAction);
            toast.success('다이어리가 성공적으로 등록되었습니다!');
            handleCloseModal();
        } catch (err) {
            toast.error('다이어리 등록에 실패했습니다.');
            console.error('다이어리 저장 실패:', err);
        }
    }, [
        dispatch,
        selectedDate,
        activeTab,
        currentMomentData,
        currentMovieData,
        currentBookData,
        handleCloseModal,
    ]);

    const handleTabChange = useCallback((tab: DiaryType) => {
        setActiveTab(tab);
    }, []);

    // 모달 외부 클릭을 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                handleCloseModal();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleCloseModal]);

    // 다이어리 상세 데이터가 로드되면 Redux 상태 업데이트 (기존 로직)
    useEffect(() => {
        // 이 부분은 기존 다이어리 수정/상세조회 기능과 관련이 있습니다.
        if (diaryData) {
            setActiveTab(diaryData.diaryType);
            dispatch(clearCurrentData());
            // TODO: 상세 조회 API 호출 및 데이터 업데이트 로직 구현 필요
        }
    }, [diaryData, dispatch]);

    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleCloseModal}>
            <div className='diary-modal' ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
                <div className='diary-modal-header'>
                    <button
                        className='diary-modal-close'
                        onClick={handleCloseModal}
                        disabled={isLoading || isUploading}
                    >
                        <XIcon width='24' height='24' fill='var(--color-xl)' />
                    </button>
                    <button
                        className='diary-modal-save'
                        onClick={handleSave}
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
                        {activeTab === 'DAILY' && <MomentContent />}
                        {activeTab === 'MOVIE' && <MovieContent />}
                        {activeTab === 'BOOK' && <BookContent />}
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
            </div>
        </div>
    );
};

export default DiaryModalBase;