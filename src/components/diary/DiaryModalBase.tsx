import React, { useEffect, useState } from 'react'
import { CheckIcon, XIcon } from '../../assets/icons';
import TrashBinIcon from '../../assets/icons/TrashBinIcon';

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