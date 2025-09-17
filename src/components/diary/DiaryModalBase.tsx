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
    getDiaryDetailAsync,
    updateDiaryAsync,
} from '../../store/slices/diarySlice';
import {
    CreateDiaryRequest,
    UpdateDiaryRequest,
    DailyContent,
    MovieContent as MovieContentType,
    BookContent as BookContentType,
} from '../../types/diary.types';
import MomentContent from './MomentContent';
import MovieContent from './MovieContent';
import BookContent from './BookContent';
import toast from 'react-hot-toast';
import { unwrapResult } from '@reduxjs/toolkit';
import { set } from 'date-fns';

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
        currentDiaryDetail,
    } = useAppSelector(state => state.diary);

    const modalContentRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    const handleCloseModal = useCallback(() => {
        dispatch(clearCurrentData());
        dispatch(clearError());
        onClose();
    }, [dispatch, onClose]);

    // 다이어리 저장 핸들러 (수정/등록 분기처리)
    const handleSave = useCallback(async () => {
        if (!selectedDate) return;

        let contentData: any;
        let imageUrl;

        switch (activeTab) {
            case 'DAILY':
                contentData = { ...currentMomentData };
                imageUrl = currentMomentData.imageUrl;
                delete contentData.imageUrl;
                break;
            case 'MOVIE':
                contentData = { ...currentMovieData };
                imageUrl = currentMovieData.imageUrl;
                delete contentData.imageUrl;
                break;
            case 'BOOK':
                contentData = { ...currentBookData };
                imageUrl = currentBookData.imageUrl;
                delete contentData.imageUrl;
                break;
            default:
                return;
        }

        const diaryDataBody: CreateDiaryRequest = {
            diaryDate: selectedDate,
            diaryType: activeTab,
            imageUrl: imageUrl || undefined,
            content: contentData,
        };

        try {
            if (diaryData?.id) { // 수정 모드 : id가 있는 경우
                await dispatch(updateDiaryAsync({
                    id: diaryData.id,
                    diaryData: diaryDataBody as UpdateDiaryRequest
                })).unwrap();
                toast.success('다이어리가 성공적으로 등록되었습니다!');
            } else { // 등록 모드 : id가 없는 경우
                await dispatch(createDiaryAsync({ 
                    diaryData: diaryDataBody
                 })).unwrap();
                 toast.error('다이어리 등록에 실패했습니다.');
            }
            onClose();
        } catch (error) {
            toast.error('다이어리 등록에 실패했습니다.');
        }
    }, [
        dispatch,
        selectedDate,
        activeTab,
        currentMomentData,
        currentMovieData,
        currentBookData,
        onClose,
        diaryData
    ]);

    // 탭 변경 핸들러
    const handleTabChange = (newTab: DiaryType) => {
        // 기존 다이어리 데이터가 있고, 탭을 변경하는 경우
        if (diaryData && newTab !== activeTab) {
            const confirmChange = window.confirm(
                '탭을 변경하면 현재 작성 중인 내용이 사라집니다. 계속하시겠습니까?'
            );
            if (!confirmChange) return;
            dispatch(clearCurrentData()); // 현재 데이터 초기화
        }
        setActiveTab(newTab);
    }

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

    // 모달이 열리고, 데이터가 있을 때만 상세 정보 불러오기
    useEffect(() => {
        if (isOpen && diaryData && selectedDate) {
            dispatch(getDiaryDetailAsync({ date: selectedDate }));
        } else if (isOpen) {
            setActiveTab('DAILY');
        }
    }, [isOpen, diaryData, selectedDate, dispatch]);

    // 상세 정보 로드가 완료되면 activeTab 및 상태 업데이트
    useEffect(() => {
        if (currentDiaryDetail && currentDiaryDetail.diaryType) {
            setActiveTab(currentDiaryDetail.diaryType);
        }
    }, [currentDiaryDetail]);

    const isEditMode = !!diaryData;

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

                {isEditMode && (
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