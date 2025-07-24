import React, { useEffect, useState } from 'react'
import { CheckIcon, XIcon } from '../../assets/icons';
import TrashBinIcon from '../../assets/icons/TrashBinIcon';
import MomentContent from './MomentContent';
import { render } from '@testing-library/react';
import MovieContent from './MovieContent';
import BookContent from './BookContent';

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

    // 모달 외부 클릭시 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 탭 변경 핸들러
    const handleTabChange = (tab: DiaryType) => {
        setActiveTab(tab);
    };

    // 친구 태그 제거 핸들러
    const handleRemoveTag = (tagToRemove: string) => {
        
    };

    // 저장
    const handleSave = () => {

    }

    // 삭제
    const handleDelete = () => {
    
    }

    // 탭에 따른 컨텐츠 렌더링
    const renderContent = () => {
        const commonProps = {
            imagePreview,
            onImageUpload: handleImageUpload
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
                        onClick={onClose}
                        fill="var(--color-xl)"
                    />
                    <CheckIcon
                        className="diary-modal-save"
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
                        />
                    </div>
                    <div className="diary-friend-tags">
                        <span className="diary-friend-tag">
                        @woogamjaa
                        <button onClick={() => handleRemoveTag('@woogamjaa')}>×</button>
                        </span>
                        <span className="diary-friend-tag">
                        @my_sky_corolla
                        <button onClick={() => handleRemoveTag('@my_sky_corolla')}>×</button>
                        </span>
                    </div>
                </div>
            </div>

            <div className="diary-modal-delete">
                <TrashBinIcon
                    className="diary-modal-delete-icon"
                    fill="var(--color-xl)"
                    onClick={() => {
                        // 삭제 로직 구현
                    }}
                />
            </div>
        </div>
    )
}

export default DiaryModalBase