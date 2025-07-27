import React, { useState } from 'react'
import { LocationIcon } from '../../assets/icons';

interface MomentContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    initialData?: {
        title?: string;
        location?: string;
        memo?: string;
    };
}

const MomentContent: React.FC<MomentContentProps> = ({
    imagePreview,
    onImageUpload,
    initialData
}) => {
    const [ title, setTitle ] = useState(initialData?.title || '');
    const [ location, setLocation ] = useState(initialData?.location || '');
    const [ memo, setMemo ] = useState(initialData?.memo || '');

    return (
        <div className="moment-content">
            <div className="first-row">
                <div className="image-section">
                    <div className="image-upload">
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
                            type="file"
                            accept="image/*"
                            onChange={ onImageUpload }
                            className="file-input"
                            id="moment-image-upload"
                        />
                        <label htmlFor="moment-image-upload" className="upload-button">
                            이미지 선택
                        </label>
                    </div>
                </div>

                <div className="input-section">
                    <input
                        type="text"
                        placeholder="title"
                        value={ title }
                        onChange={(e) => setTitle(e.target.value)}
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
                            value={ location }
                            onChange={(e) => setLocation(e.target.value)}
                            className="location-input"
                        />
                    </div>
                </div>
            </div>
            
            <div className="second-row">
                <div className="memo-group">
                    <span className="memo-label">Memo</span>
                    <textarea
                        value={ memo }
                        onChange={(e) => setMemo(e.target.value)}
                        className="memo-textarea"
                        rows={8}
                    />
                </div>
            </div>
        </div>
    )
}

export default MomentContent