import React, { useRef } from 'react'
import { LocationIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMomentData } from '../../store/slices/diarySlice';

interface MomentContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDataChange?: (hasChange: boolean) => void;
    initialData?: {
        title?: string;
        location?: string;
        memo?: string;
    };
}

const MomentContent: React.FC<MomentContentProps> = ({
    imagePreview,
    onImageUpload,
    onDataChange,
    initialData
}) => {
    const dispatch = useAppDispatch();
    const momentData = useAppSelector(state => state.diary.currentMomentData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMomentData({ title: e.target.value }));
        onDataChange?.(true);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMomentData({ location: e.target.value }));
        onDataChange?.(true);
    };

    const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateMomentData({ memo: e.target.value }));
        onDataChange?.(true);
    };

    // 이미지 클릭 핸들러
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    // 이미지 업로드 매핑
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onImageUpload(e);
        onDataChange?.(true);
    };

    return (
        <div className="moment-content">
            <div className="first-row">
                <div className="image-section">
                    <div className="image-upload" onClick={ handleImageClick } style={{ cursor: 'pointer' }}>
                        {imagePreview ? (
                            <img 
                                src={ imagePreview }
                                alt="Preview"
                                className="preview-image"
                            />
                        ) : (
                            <div className="image-placeholder">
                                <span>이미지를 업로드하세요.</span>
                            </div>
                        )}
                        <input
                            ref={ fileInputRef }
                            type="file"
                            accept="image/*"
                            onChange={ handleFileChange }
                            className="file-input"
                            id="moment-image-upload"
                            style={{ display: 'none'}}
                        />
                        {!imagePreview && (
                            <label htmlFor="moment-image-upload" className="upload-button">
                                이미지 선택
                            </label>
                        )}
                    </div>
                </div>

                <div className="input-section">
                    <input
                        type="text"
                        placeholder="title"
                        value={ momentData.title }
                        onChange={ handleTitleChange }
                        className="title-input"
                    />

                    <div className="location-group">
                        <span className="location-label">Location</span>
                        <LocationIcon
                            className="location-icon"
                            fill="var(--color-xl)"
                        />
                        <input
                            type="text"
                            value={ momentData.location }
                            onChange={ handleLocationChange }
                            className="location-input"
                        />
                    </div>
                </div>
            </div>
            
            <div className="second-row">
                <div className="memo-group">
                    <span className="memo-label">Memo</span>
                    <textarea
                        value={ momentData.memo }
                        onChange={ handleMemoChange }
                        className="memo-textarea"
                        rows={8}
                    />
                </div>
            </div>
        </div>
    )
}

export default MomentContent