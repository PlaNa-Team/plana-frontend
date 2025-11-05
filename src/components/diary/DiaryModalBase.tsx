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
    updateDiaryAsync,
    deleteDiaryAsync,
    searchMembersAsync,
    addTag,
    removeTag,
    clearSearchResults,
    clearAllTags,
    getDiaryDetailWithLockAsync,
    releaseDiaryLockAsync,
    renewDiaryLockAsync,
} from '../../store/slices/diarySlice';
import {
    CreateDiaryRequest,
    DailyContent,
    MovieContent as MovieContentType,
    BookContent as BookContentType,
    FriendItem,
} from '../../types/diary.types';
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
    const renewIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState<DiaryType>(diaryData?.diaryType || 'DAILY');

    const isEditMode = !!diaryData;

    /** 🔐 모달 닫기 시: 락 해제 및 상태 초기화 */
    const handleCloseModal = useCallback(async () => {
        if (diaryData?.id) {
            await dispatch(releaseDiaryLockAsync(diaryData.id));
        }
        onClose(); // 먼저 닫고
        setTimeout(() => {
            dispatch(clearCurrentData()); // 나중에 초기화
            dispatch(clearError());
            dispatch(clearAllTags());
            dispatch(clearSearchResults());
        }, 100);
    }, [dispatch, onClose, diaryData]);    

    /** 💾 저장 (등록/수정 분기) */
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

        const diaryBody: CreateDiaryRequest = {
            diaryDate: selectedDate,
            diaryType: activeTab,
            imageUrl: imageUrl || undefined,
            content: contentData,
            diaryTags: selectedTags,
        };

        try {
            if (isEditMode && diaryData?.id) {
                await dispatch(updateDiaryAsync({ id: diaryData.id, payload: diaryBody })).unwrap();
                toast.success('다이어리가 수정되었습니다!');
            } else {
                await dispatch(createDiaryAsync({ diaryData: diaryBody })).unwrap();
                toast.success('다이어리가 저장되었습니다!');
            }
            await handleCloseModal();
        } catch (error) {
            toast.error('다이어리 저장에 실패했습니다.');
        }
    }, [
        dispatch,
        selectedDate,
        activeTab,
        currentMomentData,
        currentMovieData,
        currentBookData,
        selectedTags,
        isEditMode,
        diaryData,
        handleCloseModal,
    ]);

    /** 🗑 다이어리 삭제 */
    const handleDelete = useCallback(async () => {
        if (!diaryData?.id) {
            toast.error('삭제할 다이어리가 없습니다.');
            return;
        }

        const confirmDelete = window.confirm('정말로 이 다이어리를 삭제하시겠습니까?');
        if (confirmDelete) {
            try {
                await dispatch(deleteDiaryAsync(diaryData.id)).unwrap();
                toast.success('다이어리가 삭제되었습니다!');
                await handleCloseModal();
            } catch {
                toast.error('다이어리 삭제에 실패했습니다.');
            }
        }
    }, [dispatch, diaryData, handleCloseModal]);

    /** 🔄 탭 전환 시 */
    const handleTabChange = (newTab: DiaryType) => {
        if (diaryData && newTab !== activeTab) {
            const confirmChange = window.confirm(
                '탭을 변경하면 현재 작성 중인 내용이 사라집니다. 계속하시겠습니까?'
            );
            if (!confirmChange) return;
            dispatch(clearCurrentData());
        }
        setActiveTab(newTab);
    };

    /** 🧠 모달 외부 클릭 시 닫기 */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                handleCloseModal();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleCloseModal]);

    /** 🧷 상세 조회 & 락 획득 */
    useEffect(() => {
        if (isOpen && diaryData?.id && selectedDate) {
            dispatch(getDiaryDetailWithLockAsync(selectedDate));
        } else if (isOpen) {
            setActiveTab('DAILY');
        }
    }, [isOpen, diaryData, selectedDate, dispatch]);

    /** 🔁 락 자동 갱신 (expiresAt 3초 전) */
    useEffect(() => {
        if (lockExpiresAt && diaryData?.id) {
            const expires = new Date(lockExpiresAt).getTime();
            const now = new Date().getTime();
            const delay = Math.max(expires - now - 3000, 0);
            if (renewIntervalRef.current) clearTimeout(renewIntervalRef.current);
            renewIntervalRef.current = setTimeout(() => {
                dispatch(renewDiaryLockAsync(diaryData.id));
            }, delay);
        }
        return () => {
            if (renewIntervalRef.current) clearTimeout(renewIntervalRef.current);
        };
    }, [lockExpiresAt, dispatch, diaryData]);

    /** 🔍 친구 검색 */
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

    /** 👥 친구 태그 추가 / 삭제 */
    const handleAddTag = useCallback(
        (friend: FriendItem) => {
            dispatch(addTag({ tagText: friend.loginId }));
            dispatch(clearSearchResults());
            setSearchInput('');
        },
        [dispatch]
    );

    const handleRemoveTag = useCallback(
        (loginId: string) => {
            dispatch(removeTag(loginId));
        },
        [dispatch]
    );

    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleCloseModal}>
            <div className="diary-modal" ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
                <div className="diary-modal-header">
                    <button
                        className="diary-modal-close"
                        onClick={handleCloseModal}
                        disabled={isLoading || isUploading}
                    >
                        <XIcon width="24" height="24" fill="var(--color-xl)" />
                    </button>
                    <button
                        className="diary-modal-save"
                        onClick={handleSave}
                        disabled={isLoading || isUploading}
                    >
                        <CheckIcon width="24" height="24" fill="var(--color-xl)" />
                    </button>
                </div>

                <div className="diary-modal-main">
                    <div className="diary-modal-sidebar">
                        <button
                            className={`diary-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                            onClick={() => handleTabChange('DAILY')}
                        >
                            <span className="diary-tab-text">
                                D<br />A<br />I<br />L<br />Y
                            </span>
                        </button>
                        <button
                            className={`diary-tab ${activeTab === 'MOVIE' ? 'active' : ''}`}
                            onClick={() => handleTabChange('MOVIE')}
                        >
                            <span className="diary-tab-text">
                                M<br />O<br />V<br />I<br />E
                            </span>
                        </button>
                        <button
                            className={`diary-tab ${activeTab === 'BOOK' ? 'active' : ''}`}
                            onClick={() => handleTabChange('BOOK')}
                        >
                            <span className="diary-tab-text">
                                B<br />O<br />O<br />K
                            </span>
                        </button>
                    </div>

                    <div className="tab-content">
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

                    {searchInput.length > 0 && friendSearchResults.length > 0 && (
                        <ul className="search-results-list">
                            {friendSearchResults.map(friend => (
                                <li key={friend.id} onClick={() => handleAddTag(friend)}>
                                    {friend.loginId}
                                </li>
                            ))}
                        </ul>
                    )}

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
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        <TrashBinIcon className="diary-modal-delete-icon" fill="var(--color-xl)" />
                    </button>
                )}

                {(isLoading || isUploading) && (
                    <div className="loading-overlay">
                        <div className="loading-spinner">
                            {isUploading ? '이미지 업로드 중...' : '로딩 중...'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiaryModalBase;