import React, { useRef, useEffect } from 'react';
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMovieData, uploadTempImageAsync } from '../../store/slices/diarySlice';

interface MovieContentProps {
}

const MovieContent: React.FC<MovieContentProps> = () => {
    const dispatch = useAppDispatch();
    const movieData = useAppSelector(state => state.diary.currentMovieData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch(uploadTempImageAsync({ file, diaryType: 'MOVIE'}));
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ title: e.target.value }));
    };

    const handleDirectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ director: e.target.value }));
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ genre: e.target.value }));
    };

    const handleActorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ actors: e.target.value }));
    };

    const handleReleaseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ releaseDate: e.target.value }));
    };

    const handleRewatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ rewatch: e.target.checked }));
    };

    const handleStarClick = (rating: number) => {
        dispatch(updateMovieData({ rating }));
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateMovieData({ comment: e.target.value }));
    };

    const handleImageClick = () => {
        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.click();
        }
    };

    const currentRating = movieData.rating ?? 0;

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload'>
                    {movieData.imageUrl ? (
                        <img
                            src={movieData.imageUrl}
                            alt="Uploaded Preview"
                            className="image-upload-preview"
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
                        value={movieData.title}
                        onChange={handleTitleChange}
                        className='title-input'
                    />
                    <div className='info-row'>
                        <span className='info-label'>Director</span>
                        <input
                            type='text'
                            value={movieData.director}
                            onChange={handleDirectorChange}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Actors</span>
                        <input
                            type='text'
                            value={movieData.actors}
                            onChange={handleActorsChange}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Genre</span>
                        <input
                            type='text'
                            value={movieData.genre}
                            onChange={handleGenreChange}
                            className='info-input'
                        />
                    </div>
                </div>
            </div>

            <div className='second-row'>
                <div className='info-row'>
                    <span className='info-label'>Rating</span>
                    <div className='star-rating'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star ${star <= currentRating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= currentRating ? (
                                    <StarFullIcon className="star-icon filled" fill="var(--color-xl)" width="20" />
                                ) : (
                                    <StarEmptyIcon className="star-icon empty" fill="var(--color-xl)" width="20" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='comment-group'>
                    <span className='comment-label'>Comment</span>
                    <textarea
                        placeholder='영화에 대한 생각을 적어보세요.'
                        value={movieData.comment}
                        onChange={handleCommentChange}
                        className='comment-textarea'
                        rows={6}
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieContent;