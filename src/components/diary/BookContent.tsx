import React, { useState } from 'react'
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';

interface BookContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    initialData?: {
        title?: string;
        author?: string;
        genre?: string;
        publisher?: string;
        startDate?: string;
        endDate?: string;
        reread?: boolean;
        rating?: number;
        comment?: string;
    };
}

const BookContent: React.FC<BookContentProps> = ({
    imagePreview,
    onImageUpload,
    initialData
}) => {
    const [ title, setTitle ] = useState(initialData?.title || '');
    const [ author, setAuthor ] = useState(initialData?.author || '');
    const [ genre, setGenre ] = useState(initialData?.genre || '');
    const [ publisher, setPublisher ] = useState(initialData?.publisher || '');
    const [ startDate, setStartDate ] = useState(initialData?.startDate || '');
    const [ endDate, setEndDate ] = useState(initialData?.endDate || '');
    const [ reread, setReread ] = useState(initialData?.reread || false);
    const [ rating, setRating ] = useState(initialData?.rating || 0);
    const [ comment, setComment ] = useState(initialData?.comment || '');

    const handleStarClick = (selectedRating: number) => {
        setRating(selectedRating);
    }

    return (
        <div className="book-content">
            <div className="first-row">
                <div className="image-section">
                    <div className="image-upload">
                        {imagePreview ? (
                            <img 
                                src={ imagePreview }
                                alt="Book Cover"
                                className="preview-image"
                            />
                        ) : (
                            <div className="image-placeholder">
                                <span>책 표지를 업로드하세요.</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={ onImageUpload }
                            className="file-input"
                            id="book-image-upload"
                        />
                        <label htmlFor="book-image-upload" className="upload-button">
                            표지 선택
                        </label>
                    </div>
                </div>

                <div className="input-section">
                    <div className="reread-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={ reread }
                                onChange={(e) => setReread(e.target.checked)}
                                className="checkbox"
                            />
                            Reread
                        </label>
                    </div>

                    <div className="title-row">
                        <input
                            type="text"
                            placeholder="book title"
                            value={ title }
                            onChange={(e) => setTitle(e.target.value)}
                            className="title-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Author</span>
                        <input
                            type="text"
                            value={ author }
                            onChange={(e) => setAuthor(e.target.value)}
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
                        <span className="info-label">Publisher</span>
                        <input
                            type="text"
                            value={ publisher }
                            onChange={(e) => setPublisher(e.target.value)}
                            className="info-input"
                        />
                    </div>
                </div>
            </div>
                
            <div className="second-row">
                <div className="rate-period">
                <div className="rating-group">
                    <span className="rating-label">Rate</span>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={ star }
                                type="button"
                                className={`star ${star <= rating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= rating ? (
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

                <div className="info-row">
                    <span className="info-label">Period</span>
                    <div className="date-range">
                        <input
                            type="date"
                            value={ startDate }
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-input"
                        />
                        <span className="date-separator"> ~ </span>
                        <input
                            type="date"
                            value={ endDate }
                            onChange={(e) => setEndDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                </div>
                </div>

                <div className="comment-group">
                    <span className="comment-label">Comment</span>
                    <textarea
                        placeholder="책에 대한 생각을 적어보세요."
                        value={ comment }
                        onChange={(e) => setComment(e.target.value)}
                        className="comment-textarea"
                        rows={6}
                    />
                </div>
            </div>
        </div>
    )
}

export default BookContent