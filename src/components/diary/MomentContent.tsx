import React, { useRef, useEffect } from 'react';
import { LocationIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMomentData } from '../../store/slices/diarySlice';

interface MomentContentProps {
    imagePreview: string;
}

const MomentContent: React.FC<MomentContentProps> = ({
    imagePreview,
}) => {
    const dispatch = useAppDispatch();
    const momentData = useAppSelector(state => state.diary.currentMomentData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMomentData({ title: e.target.value }));
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMomentData({ location: e.target.value }));
    };

    const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateMomentData({ memo: e.target.value }));
    };

    const handleImageClick = () => {
        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.click();
        }
    };

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload-area'>
                    <input
                        type='file'
                        id='fileInput-moment'
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <div
                        className='image-box'
                        onClick={handleImageClick}
                        style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}
                    >
                        {!imagePreview && <div className='placeholder-text'>사진 업로드</div>}
                    </div>
                </div>

                <div className='input-section'>
                    <input
                        type='text'
                        placeholder='title'
                        value={momentData.title}
                        onChange={handleTitleChange}
                        className='title-input'
                    />

                    <div className='location-group'>
                        <span className='location-label'>Location</span>
                        <LocationIcon
                            className='location-icon'
                            fill='var(--color-xl)'
                        />
                        <input
                            type='text'
                            value={momentData.location}
                            onChange={handleLocationChange}
                            className='location-input'
                        />
                    </div>
                </div>
            </div>

            <div className='second-row'>
                <div className='memo-group'>
                    <span className='memo-label'>Memo</span>
                    <textarea
                        value={momentData.memo}
                        onChange={handleMemoChange}
                        className='memo-textarea'
                        rows={8}
                    />
                </div>
            </div>
        </div>
    );
};

export default MomentContent;