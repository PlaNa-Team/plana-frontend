import React, { useRef, useEffect } from 'react';
import { LocationIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMomentData, uploadTempImageAsync } from '../../store/slices/diarySlice';

interface MomentContentProps {
}

const MomentContent: React.FC<MomentContentProps> = () => {
    const dispatch = useAppDispatch();
    const momentData = useAppSelector(state => state.diary.currentMomentData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch(uploadTempImageAsync({ file, diaryType: 'DAILY'}));
        }
    };

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
                    {momentData.imageUrl ? (
                        <img
                            src={momentData.imageUrl}
                            alt="Uploaded Preview"
                            className="uploaded-image-preview"
                        />
                    ) : (
                        <>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className='file-input'
                                style={{ display: 'none'}}
                            />
                            <label
                                role='button'
                                onClick={handleImageClick}
                                className='image-upload-button'
                            >
                                이미지 업로드
                            </label>
                        </>
                    )}
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