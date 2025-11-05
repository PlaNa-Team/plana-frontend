import React, { useRef, useEffect } from 'react';
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMovieData, uploadTempImageAsync } from '../../store/slices/diarySlice';

const MovieContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const { currentMovieData, currentDiaryDetail } = useAppSelector(state => state.diary);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const didInitRef = useRef(false);

    useEffect(() => {
        if (!didInitRef.current && currentDiaryDetail && currentDiaryDetail.diaryType === 'MOVIE') {
            const content = currentDiaryDetail.content as any;
            dispatch(updateMovieData({ ...content, imageUrl: currentDiaryDetail.imageUrl }));
            didInitRef.current = true;
        }
    }, [currentDiaryDetail, dispatch]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch(uploadTempImageAsync({ file, diaryType: 'MOVIE' }));
    };

    const handleChange = (key: string, value: any) => {
        dispatch(updateMovieData({ [key]: value }));
    };

    const handleImageClick = () => fileInputRef.current?.click();
    const currentRating = currentMovieData.rating ?? 0;

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload-area'>
                    {currentMovieData.imageUrl ? (
                        <img
                            src={currentMovieData.imageUrl}
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
                        value={currentMovieData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className='title-input'
                    />
                    <div className='info-row'>
                        <span className='info-label'>Director</span>
                        <input
                            type='text'
                            value={currentMovieData.director || ''}
                            onChange={(e) => handleChange('director', e.target.value)}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Actors</span>
                        <input
                            type='text'
                            value={currentMovieData.actors || ''}
                            onChange={(e) => handleChange('actors', e.target.value)}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Genre</span>
                        <input
                            type='text'
                            value={currentMovieData.genre || ''}
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

                <div className='comment-group'>
                    <span className='comment-label'>Comment</span>
                    <textarea
                        placeholder='영화에 대한 생각을 적어보세요.'
                        value={currentMovieData.comment || ''}
                        onChange={(e) => handleChange('comment', e.target.value)}
                        className='comment-textarea'
                        rows={6}
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieContent;
