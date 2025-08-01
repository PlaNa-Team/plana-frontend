import React, { useRef } from 'react'
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateBookData } from '../../store/slices/diarySlice';

interface BookContentProps {
    imagePreview: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDataChange?: (hasChanges: boolean) => void;
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
    onDataChange,
    initialData
}) => {
    const dispatch = useAppDispatch();
    const bookData = useAppSelector(state => state.diary.currentBookData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ title: e.target.value }));
        onDataChange?.(true);
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ author: e.target.value }));
        onDataChange?.(true);
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ genre: e.target.value }));
        onDataChange?.(true);
    };

    const handlePublisherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ publisher: e.target.value }));
        onDataChange?.(true);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ startDate: e.target.value }));
        onDataChange?.(true);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ endDate: e.target.value }));
        onDataChange?.(true);
    };

    const handleRereadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ reread: e.target.checked }));
        onDataChange?.(true);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateBookData({ comment: e.target.value }));
        onDataChange?.(true);
    };

    const handleStarClick = (selectedRating: number) => {
        dispatch(updateBookData({ rating: selectedRating }));
        onDataChange?.(true);
    }

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
        <div className="book-content">
            <div className="first-row">
                <div className="image-section">
                    <div className="image-upload" onClick={ handleImageClick } style={{ cursor: 'pointer' }}>
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
                            ref={ fileInputRef }
                            type="file"
                            accept="image/*"
                            onChange={ handleFileChange }
                            className="file-input"
                            id="book-image-upload"
                            style={{ display: 'none' }}
                        />
                        {!imagePreview && (
                            <label htmlFor="book-image-upload" className="upload-button">
                                표지 선택
                            </label>
                        )}
                    </div>
                </div>

                <div className="input-section">
                    <div className="reread-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={ bookData.reread }
                                onChange={ handleRereadChange }
                                className="checkbox"
                            />
                            Reread
                        </label>
                    </div>

                    <div className="title-row">
                        <input
                            type="text"
                            placeholder="book title"
                            value={ bookData.title }
                            onChange={ handleTitleChange }
                            className="title-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Author</span>
                        <input
                            type="text"
                            value={ bookData.author }
                            onChange={ handleAuthorChange }
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Genre</span>
                        <input
                            type="text"
                            value={ bookData.genre }
                            onChange={ handleGenreChange }
                            className="info-input"
                        />
                    </div>

                    <div className="info-row">
                        <span className="info-label">Publisher</span>
                        <input
                            type="text"
                            value={ bookData.publisher }
                            onChange={ handlePublisherChange }
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
                                className={`star ${star <= bookData.rating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= bookData.rating ? (
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
                            value={ bookData.startDate }
                            onChange={ handleStartDateChange }
                            className="date-input"
                        />
                        <span className="date-separator"> ~ </span>
                        <input
                            type="date"
                            value={ bookData.endDate }
                            onChange={ handleEndDateChange }
                            className="date-input"
                        />
                    </div>
                </div>
                </div>

                <div className="comment-group">
                    <span className="comment-label">Comment</span>
                    <textarea
                        placeholder="책에 대한 생각을 적어보세요."
                        value={ bookData.comment }
                        onChange={ handleCommentChange }
                        className="comment-textarea"
                        rows={6}
                    />
                </div>
            </div>
        </div>
    )
}

export default BookContent