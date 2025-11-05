import React, { useRef, useEffect } from 'react';
import { LocationIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMomentData, uploadTempImageAsync } from '../../store/slices/diarySlice';

const MomentContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const { currentMomentData, currentDiaryDetail } = useAppSelector(state => state.diary);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 상세 데이터 존재 시 초기값 반영
    const didInitRef = useRef(false);

    useEffect(() => {
        if (!didInitRef.current && currentDiaryDetail && currentDiaryDetail.diaryType === 'DAILY') {
            const { title, location, memo } = currentDiaryDetail.content as any;
            dispatch(updateMomentData({ title, location, memo, imageUrl: currentDiaryDetail.imageUrl }));
            didInitRef.current = true;
        }
    }, [currentDiaryDetail, dispatch]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch(uploadTempImageAsync({ file, diaryType: 'DAILY' }));
        }
    };

    const handleInputChange = (key: 'title' | 'location' | 'memo', value: string) => {
        dispatch(updateMomentData({ [key]: value }));
    };

    const handleImageClick = () => fileInputRef.current?.click();

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload-area'>
                    {currentMomentData.imageUrl ? (
                        <img
                            src={currentMomentData.imageUrl}
                            alt='Uploaded Preview'
                            className='uploaded-image-preview'
                            onClick={handleImageClick}
                        />
                    ) : (
                        <>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className='file-input'
                                style={{ display: 'none' }}
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
                        value={currentMomentData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className='title-input'
                    />

                    <div className='location-group'>
                        <span className='location-label'>Location</span>
                        <LocationIcon className='location-icon' fill='var(--color-xl)' />
                        <input
                            type='text'
                            value={currentMomentData.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className='location-input'
                        />
                    </div>
                </div>
            </div>

            <div className='second-row'>
                <div className='memo-group'>
                    <span className='memo-label'>Memo</span>
                    <textarea
                        value={currentMomentData.memo || ''}
                        onChange={(e) => handleInputChange('memo', e.target.value)}
                        className='memo-textarea'
                        rows={8}
                    />
                </div>
            </div>
        </div>
    );
};

export default MomentContent;