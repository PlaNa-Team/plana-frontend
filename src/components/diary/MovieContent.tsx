import React, { useState } from 'react'

interface MovieContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    initialData
}) => {
    const [ title, setTitle ] = useState(initialData?.title || '');
    const [ director, setDirector ] = useState(initialData?.director || '');
    const [ genre, setGenre ] = useState(initialData?.genre || '');
    const [ actors, setActors ] = useState(initialData?.actors || '');
    const [ releaseDate, setReleaseDate ] = useState(initialData?.releaseDate || '');
    const [ rewatch, setRewatch ] = useState(initialData?.rewatch || false);
    const [ rating, setRating ] = useState(initialData?.rating || 0);
    const [ comment, setComment ] = useState(initialData?.comment || '');

    const handleStarClick = (selectedRating: number) => {
        setRating(selectedRating);
    }

    return (
        <div className="movie-content">
            <div className="image-section">
                <div className="image-upload">
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
                        type="file"
                        accept="image/*"
                        onChange={ onImageUpload }
                        className="file-input"
                        id="movie-image-upload"
                    />
                    <label htmlFor="movie-image-upload" className="upload-button">
                        포스터 선택
                    </label>
                </div>
            </div>

            <div className="input-section">
                <div className="input-group diary-title-row">
                    <input
                        type="text"
                        placeholder="movie title"
                        value={ title }
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input"
                    />
                    <div className="rewatch-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={ rewatch }
                                onChange={(e) => setRewatch(e.target.checked)}
                                className="rewatch-checkbox"
                            />
                            Rewatched
                        </label>
                    </div>
                </div>

                <div className="movie-info">
                    <div className="info-row">
                        <span className="info-label">Director</span>
                        <input
                            type="text"
                            value={ director }
                            onChange={(e) => setDirector(e.target.value)}
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Genre</span>
                        <input
                            type="text"
                            value={ genre }
                            onChange={(e) => setGenre(e.target.value)}
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Cast</span>
                        <input
                            type="text"
                            value={ actors }
                            onChange={(e) => setActors(e.target.value)}
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Date</span>
                        <input
                            type="date"
                            value={ releaseDate }
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="info-input"
                        />
                    </div>

                    <div className="rating-group">
                        <span className="rating-label">Rate</span>
                        <div className="stars">
                            {[1,2,3,4,5].map((star) => (
                                <button
                                    key={ star }
                                    type="button"
                                    className={`star ${star <= rating ? 'filled' : ''}`}
                                    onClick={() => handleStarClick(star)}
                                >
                                    <span className="star-icon">★</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <span className="comment-label">Comment</span>
                        <textarea
                            placeholder="영화에 대한 생각을 적어보세요."
                            value={ comment }
                            onChange={(e) => setComment(e.target.value)}
                            className="comment-textarea"
                            rows={6}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieContent