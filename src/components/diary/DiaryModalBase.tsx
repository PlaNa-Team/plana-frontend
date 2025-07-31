import React, { useEffect, useState, useRef } from 'react'
import { CheckIcon, XIcon } from '../../assets/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { clearCurrentData } from '../../store/slices/diarySlice';

import TrashBinIcon from '../../assets/icons/TrashBinIcon';
import MomentContent from './MomentContent';
import MovieContent from './MovieContent';
import BookContent from './BookContent';
import CustomToast from '../ui/Toast';
import CustomAlertDialog from '../ui/AlertDialog';

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
        // 각 타입별 추가 데이터들
        location?: string;
        memo?: string;
        director?: string;
        genre?: string;
        actors?: string;
        releaseDate?: string;
        author?: string;
        publisher?: string;
        startDate?: string;
        endDate?: string;
        rewatch?: boolean;
        reread?: boolean;
        rating?: number;
        comment?: string;
    } | null;
}

const DiaryModalBase: React.FC<DiaryModalBaseProps> = ({
    isOpen,
    onClose,
    selectedDate,
    diaryData
}) => {
    const [ activeTab, setActiveTab ] = useState<DiaryType>('DAILY');
    const [ imagePreview, setImagePreview ] = useState<string>('');
    const [ hasChanges, setHasChanges ] = useState(false);
    const [ friendTags, setFriendTags ] = useState<string[]>([]);
    const [ friendInput, setFriendInput ] = useState('');
    const [ showToast, setShowToast ] = useState(false);

    // 경고 모달 관련 상태
    const [ showConfirmDialog, setShowConfirmDialog ] = useState(false);
    const [ confirmMessage, setConfirmMessage ] = useState<string>('');
    const pendingActionRef = useRef<(() => void) | null>(null);

    const dispatch = useAppDispatch();
    const { currentMomentData, currentMovieData, currentBookData } = useAppSelector(state => state.diary);
    
    // 모달이 열릴 떄 기존 데이터가 있으면 해당 탭으로 설정
    useEffect(() => {
        if (isOpen && diaryData) {
            setActiveTab(diaryData.diaryType);
            setImagePreview(diaryData.imageUrl);
        } else if (isOpen && !diaryData) {
            setActiveTab('DAILY');
            setImagePreview('');
        }
    }, [ isOpen, diaryData ]);

    // 현재 탭에 데이터가 있는지 확인하는 함수
    const hasDataInCurrentTab = (): boolean => {
        if (imagePreview) return true;
        if (friendTags.length > 0) return true;

        switch (activeTab) {
            case 'DAILY':
                return !!(currentMomentData.title || currentMomentData.location || currentMomentData.memo);
            case 'MOVIE':
                return !!(currentMovieData.title || currentMovieData.director || currentMovieData.genre || 
                         currentMovieData.actors || currentMovieData.comment || currentMovieData.rating > 0);
            case 'BOOK':
                return !!(currentBookData.title || currentBookData.author || currentBookData.genre || 
                         currentBookData.publisher || currentBookData.comment || currentBookData.rating > 0);
            default:
                return false;
        }
    };

    // 경고 모달 메시지
    const showConfirmation = (message: string, action: () => void) => {
        setConfirmMessage(message);
        pendingActionRef.current = action;
        setShowConfirmDialog(true);
    };

    // 경고 모달 - 확인 버튼 클릭
    const handleConfirmAction = () => {
        if (pendingActionRef.current) {
            pendingActionRef.current();
        }
        // 상태 초기화
        setShowConfirmDialog(false);
        pendingActionRef.current = null;
        setConfirmMessage('');
    };

    // 경고 모달 - 취소 버튼 클릭
    const handleConfirmCancel = () => {
        setShowConfirmDialog(false);
        pendingActionRef.current = null;
        setConfirmMessage('');
    };

    // 모달 닫기 핸들러
    const handleCloseAttempt = () => {
        if (hasChanges) {
            showConfirmation("수정된 내용이 사라집니다. 진행하시겠습니까?", () => {
                // 상태 초기화 후 모달 닫기
                setHasChanges(false);
                dispatch(clearCurrentData());
                setImagePreview('');
                setFriendTags([]);
                setFriendInput('');
                onClose();
            });
        } else {
            onClose();
        }
    };

    // 모달 외부 클릭시 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCloseAttempt();
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setHasChanges(true);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // 탭 변경 핸들러
    const handleTabChange = (tab: DiaryType) => {
        if (hasDataInCurrentTab() && tab !== activeTab) {
            showConfirmation("현재 기록이 사라집니다. 이동하시겠습니까?", () => {
                setActiveTab(tab);
                dispatch(clearCurrentData());
                setImagePreview('');
                setFriendTags([]);
                setFriendInput('');
                setHasChanges(false);
            });
        } else {
            setActiveTab(tab);
        }
    };

    // 친구 태그 제거 핸들러
    const handleRemoveTag = (tagToRemove: string) => {
        setFriendTags(prev => prev.filter(tag => tag !== tagToRemove));
        setHasChanges(true);
    };

    // 친구 태그 추가 핸들러
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && friendInput.trim()) {
            const newTag = friendInput.startsWith('@') ? friendInput : `@${friendInput}`;

            if (!friendTags.includes(newTag)) {
                setFriendTags(prev => [...prev, newTag]);
                setHasChanges(true);
            }
            setFriendInput('');
        }
    };

    // 저장
    const handleSave = () => {
        setShowToast(true);
        setHasChanges(false);
    }

    // 삭제 핸들러
    const handleDeleteAttempt = () => {
        showConfirmation("현재 기록이 삭제됩니다. 진행하시겠습니까?", () => {
            dispatch(clearCurrentData());
            setImagePreview('');
            setFriendTags([]);
            setFriendInput('');
            setHasChanges(false);
            onClose();
        });
    };

    // 데이터 변경 핸들러
    const handleDataChange = (changed: boolean) => {
        setHasChanges(changed);
    }

    // 탭에 따른 컨텐츠 렌더링
    const renderContent = () => {
        const commonProps = {
            imagePreview,
            onImageUpload: handleImageUpload,
            onDataChange: handleDataChange
        };

        switch (activeTab) {
            case 'DAILY':
                return (
                    <MomentContent
                        { ...commonProps }
                        initialData={diaryData?.diaryType === 'DAILY' ? {
                            title: diaryData.title,
                            location: diaryData.location,
                            memo: diaryData.memo
                        } : undefined}
                    />
                );
            case 'MOVIE':
                return (
                    <MovieContent
                        { ...commonProps }
                        initialData={diaryData?.diaryType === 'MOVIE' ? {
                            title: diaryData.title,
                            director: diaryData.director,
                            genre: diaryData.genre,
                            actors: diaryData.actors,
                            releaseDate: diaryData.releaseDate,
                            rewatch: diaryData.rewatch,
                            rating: diaryData.rating,
                            comment: diaryData.comment
                        } : undefined}
                    />
                );
            case 'BOOK':
                return (
                    <BookContent
                        { ...commonProps }
                        initialData={diaryData?.diaryType === 'BOOK' ? {
                            title: diaryData.title,
                            author: diaryData.author,
                            genre: diaryData.genre,
                            publisher: diaryData.publisher,
                            startDate: diaryData.startDate,
                            endDate: diaryData.endDate,
                            reread: diaryData.reread,
                            rating: diaryData.rating,
                            comment: diaryData.comment
                        } : undefined}
                    />
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="diary-modal-backdrop" onClick={handleBackdropClick}>
            <div className="diary-modal">
                <div className="diary-modal-header">
                    <XIcon
                        className="diary-modal-close"
                        onClick={ handleCloseAttempt }
                        fill="var(--color-xl)"
                    />
                    <CheckIcon
                        className="diary-modal-save"
                        onClick={ handleSave }
                        fill="var(--color-xl)"
                    />
                </div>

                <div className="diary-modal-main">
                    <div className="diary-modal-sidebar">
                        <div className="diary-modal-tabs">
                            <button
                                className={`diary-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                                onClick={() => handleTabChange('DAILY')}
                            >
                                <span className="diary-tab-text">
                                    M<br/>O<br/>M<br/>E<br/>N<br/>T
                                </span>
                            </button>
                            <button
                                className={`diary-tab ${activeTab === 'MOVIE' ? 'active' : ''}`}
                                onClick={() => handleTabChange('MOVIE')}
                            >
                                <span className="diary-tab-text">
                                    M<br/>O<br/>V<br/>I<br/>E
                                </span>
                            </button>
                            <button
                                className={`diary-tab ${activeTab === 'BOOK' ? 'active' : ''}`}
                                onClick={() => handleTabChange('BOOK')}
                            >
                                <span className="diary-tab-text">
                                    B<br/>O<br/>O<br/>K
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="diary-modal-content">
                        { renderContent() }
                    </div>
                </div>

                <div className="diary-modal-friend-tags">
                    <div className="diary-friend-input">
                        <input
                            type="text"
                            placeholder="Friend"
                            value={ friendInput }
                            onChange={(e) => setFriendInput(e.target.value)}
                            onKeyDown={ handleAddTag }
                        />
                    </div>
                    <div className="diary-friend-tags">
                        { friendTags.map(tag => (
                            <span key={ tag } className="diary-friend-tag">
                                { tag }
                                <button onClick={() => handleRemoveTag(tag)}>×</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="diary-modal-delete">
                <TrashBinIcon
                    className="diary-modal-delete-icon"
                    fill="var(--color-xl)"
                    onClick={ handleDeleteAttempt }
                />
            </div>

            <CustomAlertDialog
                title="확인"
                description={ confirmMessage }
                isOpen={ showConfirmDialog }
                onOpenChange={ setShowConfirmDialog }
                onConfirm={ handleConfirmAction }
                onCancel={ handleConfirmCancel }
                confirmText='확인'
                cancelText='취소'
            />

            <CustomToast
                title="저장 성공"
                description="작성하신 내용이 성공적으로 저장되었습니다."
                isOpen={ showToast }
                onOpenChange={ setShowToast }
            />
        </div>
    )
}

export default DiaryModalBase