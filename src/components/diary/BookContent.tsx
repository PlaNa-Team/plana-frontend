import React, { useRef, useEffect } from 'react';
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateBookData, uploadTempImageAsync } from '../../store/slices/diarySlice';

const BookContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const { currentBookData, currentDiaryDetail } = useAppSelector(state => state.diary);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const didInitRef = useRef(false);

    useEffect(() => {
        if (!didInitRef.current && currentDiaryDetail && currentDiaryDetail.diaryType === 'BOOK') {
            const content = currentDiaryDetail.content as any;
            dispatch(updateBookData({ ...content, imageUrl: currentDiaryDetail.imageUrl }));
            didInitRef.current = true;
        }
    }, [currentDiaryDetail, dispatch]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch(uploadTempImageAsync({ file, diaryType: 'BOOK' }));
    };

    const handleChange = (key: string, value: any) => {
        dispatch(updateBookData({ [key]: value }));
    };

    const handleImageClick = () => fileInputRef.current?.click();
    const currentRating = currentBookData.rating ?? 0;

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload-area'>
                    {currentBookData.imageUrl ? (
                        <img
                            src={currentBookData.imageUrl}
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
                        value={currentBookData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className='title-input'
                    />
                    <div className='info-row'>
                        <span className='info-label'>Author</span>
                        <input
                            type='text'
                            value={currentBookData.author || ''}
                            onChange={(e) => handleChange('author', e.target.value)}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Publisher</span>
                        <input
                            type='text'
                            value={currentBookData.publisher || ''}
                            onChange={(e) => handleChange('publisher', e.target.value)}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Genre</span>
                        <input
                            type='text'
                            value={currentBookData.genre || ''}
                            onChange={(e) => handleChange('genre', e.target.value)}
                            className='info-input'
                        />
                    </div>
                </div>
            </div>

            <div className='second-row'>
                <div className='info-row'>
                    <span className='info-label'>Rating</span>
                    <div className='star-rating'>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type='button'
                                className={`star ${star <= currentRating ? 'filled' : 'empty'}`}
                                onClick={() => handleChange('rating', star)}
                            >
                                {star <= currentRating ? (
                                    <StarFullIcon className='star-icon filled' fill='var(--color-xl)' width='20' />
                                ) : (
                                    <StarEmptyIcon className='star-icon empty' fill='var(--color-xl)' width='20' />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='info-row'>
                    <span className='info-label'>Period</span>
                    <div className='date-range'>
                        <input
                            type='date'
                            value={currentBookData.startDate || ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className='date-input'
                        />
                        <span className='date-separator'> ~ </span>
                        <input
                            type='date'
                            value={currentBookData.endDate || ''}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className='date-input'
                        />
                    </div>
                </div>

                <div className='comment-group'>
                    <span className='comment-label'>Comment</span>
                    <textarea
                        placeholder='책에 대한 생각을 적어보세요.'
                        value={currentBookData.comment || ''}
                        onChange={(e) => handleChange('comment', e.target.value)}
                        className='comment-textarea'
                        rows={6}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookContent;