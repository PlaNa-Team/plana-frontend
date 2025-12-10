import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckIcon, XIcon, TrashBinIcon } from '../../assets/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import {
    clearCurrentData,
    clearError,
    createDiaryAsync,
    getDiaryDetailAsync,
    lockAcquireAsync,
    lockRenewAsync,
    lockReleaseAsync,
    updateDiaryAsync,
    deleteDiaryAsync,
    searchMembersAsync,
    addTag,
    removeTag,
    clearSearchResults,
    clearAllTags,
} from '../../store/slices/diarySlice';

import {
    CreateDiaryRequest,
    UpdateDiaryRequest,
    FriendItem,
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
        currentDiaryDetail,
        friendSearchResults,
        selectedTags,
        lockToken,
        lockExpiresAt,
    } = useAppSelector(state => state.diary);

    const modalContentRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    const isEditMode = !!diaryData?.id;

    // -------------------------------------------------------
    // 1) 모달 닫기
    // -------------------------------------------------------
    const handleCloseModal = useCallback(() => {
        if (diaryData?.id) dispatch(lockReleaseAsync(diaryData.id));
        dispatch(clearCurrentData());
        dispatch(clearError());
        onClose();
    }, [dispatch, onClose, diaryData]);

    // -------------------------------------------------------
    // 2) 저장 (등록 / 수정)
    // -------------------------------------------------------
    const handleSave = useCallback(async () => {
        if (!selectedDate) return;

        let contentData: any;
        let imageUrl: string | undefined;

        switch (activeTab) {
            case 'DAILY': {
                const { imageUrl: img, ...rest } = currentMomentData;
                contentData = rest;
                imageUrl = img || undefined;
                break;
            }
            case 'MOVIE': {
                const { imageUrl: img, ...rest } = currentMovieData;
                contentData = rest;
                imageUrl = img || undefined;
                break;
            }
            case 'BOOK': {
                const { imageUrl: img, ...rest } = currentBookData;
                contentData = rest;
                imageUrl = img || undefined;
                break;
            }
        }

        // *** 공통 Body (등록/수정) ***
        const baseBody: any = {
            diaryDate: selectedDate,
            diaryType: activeTab,
            imageUrl,
            content: contentData
        };

        // -------------------------------------------------------
        // 2-1) 등록일 때만 태그 포함
        // -------------------------------------------------------
        if (!isEditMode && selectedTags.length > 0) {
            baseBody.diaryTags = selectedTags;
        }

        // -------------------------------------------------------
        // 2-2) 수정일 때는 태그 제거 (백엔드 정책)
        // -------------------------------------------------------
        if (isEditMode) {
            delete baseBody.diaryTags;
        }

        try {
            if (isEditMode) {
                const result = await dispatch(updateDiaryAsync({
                    id: diaryData!.id,
                    diaryData: baseBody as UpdateDiaryRequest
                }));
                unwrapResult(result);
                toast.success('다이어리가 성공적으로 수정되었습니다!');
                await dispatch(lockReleaseAsync(diaryData!.id));
            } else {
                const result = await dispatch(createDiaryAsync({
                    diaryData: baseBody as CreateDiaryRequest
                }));
                unwrapResult(result);
                toast.success('다이어리가 등록되었습니다!');
            }

            onClose();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || '저장에 실패했습니다.');
        }

    }, [
        activeTab,
        selectedDate,
        currentMomentData,
        currentMovieData,
        currentBookData,
        selectedTags,
        isEditMode,
        diaryData,
        dispatch,
        onClose
    ]);

    // -------------------------------------------------------
    // 3) 삭제
    // -------------------------------------------------------
    const handleDelete = useCallback(async () => {
        if (!diaryData?.id) {
            toast.error('삭제할 다이어리가 없습니다.');
            return;
        }

        if (!window.confirm('정말로 이 다이어리를 삭제하시겠습니까?')) return;

        try {
            const msg = await dispatch(deleteDiaryAsync(diaryData.id)).unwrap();
            toast.success(msg);

            if (lockToken) dispatch(lockReleaseAsync(diaryData.id));

            onClose();

        } catch (e: any) {
            toast.error(e.message || '삭제 실패');
        }
    }, [dispatch, diaryData, lockToken, onClose]);

    // -------------------------------------------------------
    // 4) 탭 변경
    // -------------------------------------------------------
    const handleTabChange = (newTab: DiaryType) => {
        if (isEditMode && newTab !== activeTab) {
            if (!window.confirm('탭을 변경하면 현재 작성 중인 내용이 사라집니다. 계속하시겠습니까?')) return;
            dispatch(clearCurrentData());
        }
        setActiveTab(newTab);
    };

    // -------------------------------------------------------
    // 5) 모달 외부 클릭 → 닫기
    // -------------------------------------------------------
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
                handleCloseModal();
            }
        };

        if (isOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, handleCloseModal]);

    // -------------------------------------------------------
    // 6) 수정 모드 → 상세 정보 불러오기
    // -------------------------------------------------------
    useEffect(() => {
        if (isOpen && isEditMode && selectedDate) {
            dispatch(getDiaryDetailAsync({ date: selectedDate }));
        } else if (isOpen) {
            setActiveTab('DAILY');
        }
    }, [isOpen, isEditMode, selectedDate, dispatch]);

    // 탭 자동 동기화
    useEffect(() => {
        if (currentDiaryDetail) {
            setActiveTab(currentDiaryDetail.diaryType as DiaryType);
        }
    }, [currentDiaryDetail]);

    // -------------------------------------------------------
    // 7) 락 자동 갱신
    // -------------------------------------------------------
    useEffect(() => {
        if (!isEditMode || !diaryData?.id || !lockExpiresAt) return;

        const expires = new Date(lockExpiresAt).getTime();
        const now = Date.now();
        const renewBefore = expires - now - 3000;

        if (renewBefore > 0) {
            const timer = setTimeout(() => {
                dispatch(lockRenewAsync(diaryData.id))
                    .unwrap()
                    .catch(() => toast.error('다이어리 수정 잠금 갱신 실패'));
            }, renewBefore);

            return () => clearTimeout(timer);
        }
    }, [isEditMode, diaryData, lockExpiresAt, dispatch]);

    // -------------------------------------------------------
    // 8) 친구 검색 (등록 모드에서만)
    // -------------------------------------------------------
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value;
        setSearchInput(keyword);

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        if (keyword.length > 0) {
            searchDebounceRef.current = setTimeout(() => {
                dispatch(searchMembersAsync(keyword));
            }, 300);
        } else {
            dispatch(clearSearchResults());
        }
    };

    const handleAddTag = useCallback((friend: FriendItem) => {
        dispatch(addTag({ tagText: friend.loginId }));
        setSearchInput('');
        dispatch(clearSearchResults());
    }, [dispatch]);

    const handleRemoveTag = useCallback((loginId: string) => {
        dispatch(removeTag(loginId));
    }, [dispatch]);

    // -------------------------------------------------------
    // 9) 모달 내부 클릭 → 락 획득 시도
    // -------------------------------------------------------
    const handleAnyClickInside = () => {
        if (isEditMode && diaryData?.id && !lockToken) {
            dispatch(lockAcquireAsync(diaryData.id))
                .unwrap()
                .catch(() => toast.error('다이어리 잠금 설정 실패'));
        }
    };

    // -------------------------------------------------------
    // 10) 렌더링
    // -------------------------------------------------------
    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleCloseModal}>
            <div
                className='diary-modal'
                ref={modalContentRef}
                onClick={(e) => {
                    e.stopPropagation();
                    handleAnyClickInside();
                }}
            >
                {/* 헤더 */}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                        }}
                        disabled={isLoading || isUploading}
                    >
                        <CheckIcon width='24' height='24' fill='var(--color-xl)' />
                    </button>
                </div>

                {/* 본문 */}
                <div className='diary-modal-main'>
                    <div className='diary-modal-sidebar'>
                        <button
                            className={`diary-modal-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                            onClick={() => handleTabChange('DAILY')}
                        >
                            <span className='diary-modal-tab-text'>D<br />A<br />I<br />L<br />Y</span>
                        </button>

                        <button
                            className={`diary-modal-tab ${activeTab === 'MOVIE' ? 'active' : ''}`}
                            onClick={() => handleTabChange('MOVIE')}
                        >
                            <span className='diary-modal-tab-text'>M<br />O<br />V<br />I<br />E</span>
                        </button>

                        <button
                            className={`diary-modal-tab ${activeTab === 'BOOK' ? 'active' : ''}`}
                            onClick={() => handleTabChange('BOOK')}
                        >
                            <span className='diary-modal-tab-text'>B<br />O<br />O<br />K</span>
                        </button>
                    </div>

                    <div className='tab-content'>
                        {activeTab === 'DAILY' && <MomentContent />}
                        {activeTab === 'MOVIE' && <MovieContent />}
                        {activeTab === 'BOOK' && <BookContent />}
                    </div>
                </div>

                {/* 친구 태그 영역 */}
                <div className="diary-modal-friend-tags">
                    {!isEditMode && (
                        <>
                            <div className="diary-friend-input">
                                <input
                                    type="text"
                                    placeholder="Friend"
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {searchInput.length > 0 && friendSearchResults.length > 0 && (
                                <ul className="search-results-list">
                                    {friendSearchResults.map(friend => (
                                        <li key={friend.id} onClick={() => handleAddTag(friend)}>
                                            {friend.loginId}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    <div className="diary-friend-tags">
                        {selectedTags.map(tag => (
                            <span key={tag.tagText} className="diary-friend-tag">
                                @{tag.tagText}
                                {!isEditMode && (
                                    <button onClick={() => handleRemoveTag(tag.tagText!)}>×</button>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 삭제 버튼 */}
                {isEditMode && (
                    <button
                        className="diary-modal-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
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
