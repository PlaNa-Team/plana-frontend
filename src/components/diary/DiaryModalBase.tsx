import React, { useEffect, useState, useRef } from 'react'
import { CheckIcon, XIcon, TrashBinIcon } from '../../assets/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
    clearCurrentData,
    createDiary,
    updateDiary,
    deleteDiary,
    uploadTempImage,
    clearError
} from '../../store/slices/diarySlice';
import { 
    CreateDiaryRequest, 
    UpdateDiaryRequest,
    DailyContent,
    MovieContent,
    BookContent
} from '../../types/diary.types';
import CustomToast from '../ui/Toast';
import ModalMomentContent from './MomentContent';
import ModalMovieContent from './MovieContent';
import ModalBookContent from './BookContent';
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
        isLoading,
        isUploading,
        error
    } = useAppSelector(state => state.diary);

    const [activeTab, setActiveTab] = useState<DiaryType>('DAILY');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [hasChanges, setHasChanges] = useState(false);
    const [friendTags, setFriendTags] = useState<string[]>([]);
    const [friendInput, setFriendInput] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    // 모달이 열릴 때 기존 데이터가 있으면 해당 탭으로 설정
    useEffect(() => {
        if (isOpen && diaryData) {
            setActiveTab(diaryData.diaryType);
            setImagePreview(diaryData.imageUrl || '');
        } else if (isOpen && !diaryData) {
            setActiveTab('DAILY');
            setImagePreview('');
        }
    }, [ isOpen, diaryData?.id ]);

    // tempImageUrl이 변경되면 이미지 미리보기 업데이트
    useEffect(() => {
        if (tempImageUrl) {
            setImagePreview(tempImageUrl);
        }
    }, [tempImageUrl]);

    // 에러 처리
    useEffect(() => {
        if (error) {
            setToastMessage(`오류 발생: ${error}`);
            setShowToast(true);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // 모달 닫기 핸들러
    const handleCloseAttempt = () => {
        // 상태 초기화 후 모달 닫기
        setHasChanges(false);
        setImagePreview('');
        setFriendTags([]);
        setFriendInput('');
        dispatch(clearCurrentData());
        onClose();
    };

    // 모달 외부 클릭시 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCloseAttempt();
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await dispatch(uploadTempImage(file)).unwrap();
                setHasChanges(true);
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                setToastMessage('이미지 업로드에 실패했습니다.');
                setShowToast(true);
            }
        }
    };
    
    // 탭 변경 핸들러
    const handleTabChange = (tab: DiaryType) => {
        setActiveTab(tab);
        setHasChanges(true);
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
    const handleSave = async () => {
        if (!selectedDate) return;

        try {
            // 현재 활성 탭에 따라 content 구성
            let content: DailyContent | MovieContent | BookContent;

            switch (activeTab) {
                case 'DAILY':
                    content = {
                        title: currentMomentData.title,
                        location: currentMomentData.location,
                        memo: currentMomentData.memo
                    };
                    break;
                case 'MOVIE':
                    content = {
                        title: currentMovieData.title,
                        director: currentMovieData.director,
                        genre: currentMovieData.genre,
                        actors: currentMovieData.actors,
                        rewatch: currentMovieData.rewatch,
                        rating: currentMovieData.rating,
                        comment: currentMovieData.comment
                    };
                    break;
                case 'BOOK':
                    content = {
                        title: currentBookData.title,
                        author: currentBookData.author,
                        publisher: currentBookData.publisher,
                        genre: currentBookData.genre,
                        startDate: currentBookData.startDate,
                        endDate: currentBookData.endDate,
                        rating: currentBookData.rating,
                        comment: currentBookData.comment
                    };
                    break;
                default:
                    return;
            }

            // 친구 태그 처리
            const diaryTags = friendTags.map(tag => ({
                tagText: tag
            }));

            const requestData: CreateDiaryRequest | UpdateDiaryRequest = {
                diaryDate: selectedDate,
                diaryType: activeTab,
                imageUrl: imagePreview || tempImageUrl || undefined,
                content,
                diaryTags: diaryTags.length > 0 ? diaryTags : undefined
            };

            if (diaryData?.id) {
                // 수정
                await dispatch(updateDiary({
                    id: diaryData.id,
                    data: requestData as UpdateDiaryRequest
                })).unwrap();
                setToastMessage('다이어리 수정 성공~');
            } else {
                // 새로 작성
                await dispatch(createDiary(requestData)).unwrap();
                setToastMessage('다이어리 저장 성공~');
            }

            setShowToast(true);
            setHasChanges(false);

            // 모달 닫기
            setTimeout(() => {
                handleCloseAttempt();
            }, 1500);
        } catch (error) {
            console.error('다이어리 저장 실패:', error);
        }
    };

    // 삭제 핸들러
    const handleDeleteAttempt = async () => {
        if (!diaryData?.id) return;

        if (window.confirm('ㅈ정말로 이 다이어리를 삭제하시겠습니까?')) {
            try {
                await dispatch(deleteDiary(diaryData.id)).unwrap();
                setToastMessage('다이어리 삭제 완료!');
                setShowToast(true);

                setTimeout(() => {
                    handleCloseAttempt();
                }, 1500);
            } catch (error) {
                console.error('다이어리 삭제 실패:', error);
                setToastMessage('다이어리 삭제에 실패했습니다.');
                setShowToast(true);
            }
        }
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
                return <ModalMomentContent {...commonProps} />;
            case 'MOVIE':
                return <ModalMovieContent {...commonProps} />;
            case 'BOOK':
                return <ModalBookContent {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="diary-modal-backdrop" onClick={handleBackdropClick}>
            <div className="diary-modal">
                <div className="diary-modal-header">
                    <button 
                        className="diary-modal-close"
                        onClick={ handleCloseAttempt }
                        disabled={ isLoading }
                    >
                        <XIcon fill="var(--color-xl)"/>
                    </button>
                    <button 
                        className="diary-modal-save"
                        onClick={ handleSave }
                        disabled={isLoading || isUploading}
                    >
                        <CheckIcon fill="var(--color-xl)"/>
                    </button>
                </div>

                <div className="diary-modal-main">
                    <div className="diary-modal-sidebar">
                        <div className="diary-modal-tabs">
                            <button
                                className={`diary-tab ${activeTab === 'DAILY' ? 'active' : ''}`}
                                onClick={() => handleTabChange('DAILY')}
                            >
                                <span className="diary-tab-text">
                                    D<br/>A<br/>I<br/>L<br/>Y
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
                            disabled={ isLoading }
                        />
                    </div>
                    <div className="diary-friend-tags">
                        { friendTags.map(tag => (
                            <span key={ tag } className="diary-friend-tag">
                                { tag }
                                <button 
                                    onClick={() => handleRemoveTag(tag)}
                                    disabled={ isLoading }
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 삭제 버튼 (수정 모드일 때만 표시) */}
            { diaryData?.id && (
                <button 
                    className="diary-modal-delete"
                    onClick={ handleDeleteAttempt }
                    disabled={ isLoading }
                >
                    <TrashBinIcon
                        className="diary-modal-delete-icon"
                        fill="var(--color-xl)"
                    />
                </button>
            )}

            {/* 로딩 인디케이터 */}
            {( isLoading || isUploading ) && (
                <div className='loading-overlay'>
                    <div className='loading-spinner'>
                        { isUploading ? '이미지 업로드 중...' : '로딩 중...' }
                    </div>
                </div>      
            )}

            <CustomToast
                title={toastMessage.includes('오류') ? '오류 발생' : '저장 성공'}
                description={ toastMessage }
                isOpen={ showToast }
                onOpenChange={ setShowToast }
            />
        </div>
    );
};

export default DiaryModalBase