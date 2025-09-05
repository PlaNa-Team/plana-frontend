import React, { useRef, useEffect } from 'react';
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMovieData } from '../../store/slices/diarySlice';

interface MovieContentProps {
    imagePreview: string;
}

const MovieContent: React.FC<MovieContentProps> = ({
    imagePreview,
}) => {
    const dispatch = useAppDispatch();
    const movieData = useAppSelector(state => state.diary.currentMovieData);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className='diary-content'>
            <div className='first-row'>
                <div className='image-upload-area'>
                    <input
                        type='file'
                        id='fileInput-movie'
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
                                className={`star ${star <= movieData.rating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= movieData.rating ? (
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