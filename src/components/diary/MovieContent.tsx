import React, { useRef } from 'react'
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMovieData } from '../../store/slices/diarySlice';

interface MovieContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDataChange?: (hasChanges: boolean) => void;
    initialData?: {
        title?: string;
        director?: string;
        genre?: string;
        actors?: string;
        releaseDate?: string;
        rewatch?: boolean;
        rating?: number;
        comment?: string;
    };
}

const MovieContent: React.FC<MovieContentProps> = ({
    imagePreview,
    onImageUpload,
    onDataChange,
    initialData
}) => {
    const dispatch = useAppDispatch();
    const movieData = useAppSelector(state => state.diary.currentMovieData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ title: e.target.value }));
        onDataChange?.(true);
    };

    const handleDirectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ director: e.target.value }));
        onDataChange?.(true);
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ genre: e.target.value }));
        onDataChange?.(true);
    };

    const handleActorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ actors: e.target.value }));
        onDataChange?.(true);
    };

    const handleReleaseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ releaseDate: e.target.value }));
        onDataChange?.(true);
    };

    const handleRewatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMovieData({ rewatch: e.target.checked }));
        onDataChange?.(true);
    };

    const handleStarClick = (selectedRating: number) => {
        dispatch(updateMovieData({ rating: selectedRating }));
        onDataChange?.(true);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateMovieData({ comment: e.target.value }));
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
        <div className="movie-content">
            <div className="first-row">
                <div className="image-section">
                    <div className="image-upload" onClick={ handleImageClick } style={{ cursor: 'pointer' }}>
                        {imagePreview ? (
                            <img 
                                src={ imagePreview }
                                alt="Movie Poster"
                                className="preview-image"
                            />
                        ) : (
                            <div className="image-placeholder">
                                <span>영화 포스터를 업로드하세요.</span>
                            </div>
                        )}
                        <input
                            ref={ fileInputRef }
                            type="file"
                            accept="image/*"
                            onChange={ handleFileChange }
                            className="file-input"
                            id="movie-image-upload"
                            style={{ display: 'none' }}
                        />
                        {!imagePreview && (
                            <label htmlFor="movie-image-upload" className="upload-button">
                                포스터 선택
                            </label>
                        )}
                    </div>
                </div>

                <div className="input-section">
                    <div className="rewatch-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={ movieData.rewatch }
                                onChange={ handleRewatchChange }
                                className="checkbox"
                            />
                            Rewatched
                        </label>
                    </div>

                    <div className="title-row">
                        <input
                            type="text"
                            placeholder="movie title"
                            value={ movieData.title }
                            onChange={ handleTitleChange }
                            className="title-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Director</span>
                        <input
                            type="text"
                            value={ movieData.director }
                            onChange={ handleDirectorChange }
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Genre</span>
                        <input
                            type="text"
                            value={ movieData.genre }
                            onChange={ handleGenreChange }
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Cast</span>
                        <input
                            type="text"
                            value={ movieData.actors }
                            onChange={ handleActorsChange }
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Release</span>
                        <input
                            type="date"
                            value={ movieData.releaseDate }
                            onChange={ handleReleaseDateChange }
                            className="date-input"
                        />
                    </div>
                </div>
            </div>

            <div className="second-row">
                <div className="rating-group">
                    <span className="rating-label">Rate</span>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={ star }
                                type="button"
                                className={`star ${star <= movieData.rating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= movieData.rating ? (
                                    <StarFullIcon className="star-icon filled"
                                    fill="var(--color-xl)"
                                    width="20"/>
                                ): (
                                    <StarEmptyIcon className="star-icon empty"
                                    fill="var(--color-xl)"
                                    width="20"/>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="comment-group">
                    <span className="comment-label">Comment</span>
                    <textarea
                        placeholder="영화에 대한 생각을 적어보세요."
                        value={ movieData.comment }
                        onChange={ handleCommentChange }
                        className="comment-textarea"
                        rows={6}
                    />
                </div>
            </div>
        </div>
    )
}

export default MovieContent