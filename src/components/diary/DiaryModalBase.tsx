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
    DailyContent,
    MovieContent as MovieContentType,
    BookContent as BookContentType,
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
        error,
        currentDiaryDetail,
        friendSearchResults,
        selectedTags,
        isSearching,
        searchError,
        lockToken,
        lockExpiresAt,
    } = useAppSelector(state => state.diary);

    const modalContentRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    const handleCloseModal = useCallback(() => {
        if (diaryData?.id) dispatch(lockReleaseAsync(diaryData.id)); // 수정 모드일 때 닫으면 락 해제
        dispatch(clearCurrentData());
        dispatch(clearError());
        onClose();
    }, [dispatch, onClose, diaryData]);

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
            diaryTags: selectedTags,
        };

        try {
            if (diaryData?.id) { // 수정 모드 : id가 있는 경우
                await dispatch(updateDiaryAsync({
                    id: diaryData.id,
                    diaryData: diaryDataBody as UpdateDiaryRequest
                })).unwrap();
                toast.success('다이어리가 성공적으로 수정되었습니다!');
            } else { // 등록 모드 : id가 없는 경우
                await dispatch(createDiaryAsync({
                    diaryData: diaryDataBody as CreateDiaryRequest
                 })).unwrap();
                 toast.error('다이어리 등록에 실패했습니다.');
            }
            dispatch(lockReleaseAsync(diaryData?.id || 0)); // 수정 후 락 해제
            onClose();
        } catch (error) {
            const errorMessage = (error as any).message || '저장에 실패했습니다.';
            toast.error(errorMessage);
        }
    }, [
        dispatch,
        selectedDate,
        activeTab,
        currentMomentData,
        currentMovieData,
        currentBookData,
        onClose,
        diaryData,
        selectedTags,
    ]);

    const isEditMode = !!diaryData;

    // 다이어리 삭제 핸들러
    const handleDelete = useCallback(async () => {
        if (!diaryData?.id) {
            toast.error('삭제할 다이어리가 없습니다.');
            return;
        }

        const confirmDelete = window.confirm('정말로 이 다이어리를 삭제하시겠습니까?');
        if (!confirmDelete) return;

        try {
            const msg = await dispatch(deleteDiaryAsync(diaryData.id)).unwrap();
            toast.success(msg);
            if (lockToken) {
                dispatch(lockReleaseAsync(diaryData.id)); // 삭제 후 락 해제
            }
            onClose();
        } catch (error) {
            const errorMessage = (error as any)?.message || '다이어리 삭제에 실패했습니다.';
            toast.error(errorMessage);
        }
    }, [dispatch, diaryData, lockToken, onClose]);

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

    // 모달이 닫힐 때 친구 태그 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearAllTags());
            dispatch(clearSearchResults());
            setSearchInput('');
        }
    }, [isOpen, dispatch]);

    // 락 자동 갱신
        useEffect(() => {
            if (!isEditMode || !diaryData?.id || !lockExpiresAt) return;
            const expires = new Date(lockExpiresAt).getTime();
            const now = Date.now();
            const renewBefore = expires - now - 3000; // 만료 3초 전에 갱신 시도
    
            if (renewBefore > 0) {
                const timer = setTimeout(() => {
                    dispatch(lockRenewAsync(diaryData.id))
                        .unwrap()
                        .then(() => console.log('다이어리 수정 잠금이 갱신되었습니다.'))
                        .catch(() => toast.error('다이어리 수정 잠금 갱신에 실패했습니다.'));
                }, renewBefore);
    
                return () => clearTimeout(timer);
            }
        }, [lockExpiresAt, isEditMode, diaryData, dispatch]);

    // 친구 검색 입력 핸들러 (디바운스 적용)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value;
        setSearchInput(keyword);
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        if (keyword.length > 0) {
            searchDebounceRef.current = setTimeout(() => {
                dispatch(searchMembersAsync(keyword));
            }, 300);
        } else {
            dispatch(clearSearchResults());
        }
    };

    // 검색된 친구 클릭 시 태그 추가
    const handleAddTag = useCallback((friend: FriendItem) => {
        dispatch(addTag({ tagText: friend.loginId}));
        dispatch(clearSearchResults()); // 검색 결과 초기화
        setSearchInput(''); // 검색창 초기화
    }, [dispatch]);

    // 태그 삭제 핸들러
    const handleRemoveTag = useCallback((loginId: string) => {
        dispatch(removeTag(loginId));
    }, [dispatch]);

    // 모달 내부 클릭 시 락 획득
    const handleAnyClickInside = useCallback(async () => {
        if (isEditMode && diaryData?.id && !lockToken) {
            dispatch(lockAcquireAsync(diaryData.id))
                .unwrap()
                .then(() => toast.success('다이어리 수정 잠금이 설정되었습니다.'))
                .catch(() => toast.error('다이어리 수정 잠금 설정에 실패했습니다.'));
        }
    }, [dispatch, diaryData, isEditMode, lockToken]);

    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleCloseModal}>
            <div className='diary-modal' 
                ref={modalContentRef} 
                onClick={(e) => {
                    e.stopPropagation()
                    handleAnyClickInside();
                }}
            >
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

                <div className='diary-modal-main'>
                    <div className='diary-modal-sidebar'>
                        <button
                            className={`diary-modal-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                            onClick={() => handleTabChange('DAILY')}
                        >
                            <span className='diary-modal-tab-text'>
                                D<br/>A<br/>I<br/>L<br/>Y
                            </span>
                        </button>
                        <button
                            className={`diary-modal-tab ${activeTab === 'MOVIE' ? 'active' : ''}`}
                            onClick={() => handleTabChange('MOVIE')}
                        >
                            <span className='diary-modal-tab-text'>
                                M<br/>O<br/>V<br/>I<br/>E
                            </span>
                        </button>
                        <button
                            className={`diary-modal-tab ${activeTab === 'BOOK' ? 'active' : ''}`}
                            onClick={() => handleTabChange('BOOK')}
                        >
                            <span className='diary-modal-tab-text'>
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

                <div className="diary-modal-friend-tags">
                    <div className="diary-friend-input">
                        <input
                            type="text"
                            placeholder="Friend"
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* 검색 결과 목록 */}
                    {searchInput.length > 0 && friendSearchResults.length > 0 && (
                        <ul className="search-results-list">
                            {friendSearchResults.map(friend => (
                                <li key={friend.id} onClick={() => handleAddTag(friend)}>
                                    {friend.loginId}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* 선택된 태그 목록 */}
                    <div className="diary-friend-tags">
                        {selectedTags.map(tag => (
                            <span key={tag.tagText} className="diary-friend-tag">
                                @{tag.tagText}
                                <button onClick={() => tag.tagText && handleRemoveTag(tag.tagText)}>×</button>
                                </span>
                        ))}
                    </div>
                </div>

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