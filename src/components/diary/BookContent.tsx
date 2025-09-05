import React, { useRef, useEffect } from 'react';
import { StarEmptyIcon, StarFullIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateBookData } from '../../store/slices/diarySlice';

interface BookContentProps {
    imagePreview: string;
}

const BookContent: React.FC<BookContentProps> = ({
    imagePreview,
}) => {
    const dispatch = useAppDispatch();
    const bookData = useAppSelector(state => state.diary.currentBookData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ title: e.target.value }));
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ author: e.target.value }));
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ genre: e.target.value }));
    };

    const handlePublisherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ publisher: e.target.value }));
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ startDate: e.target.value }));
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ endDate: e.target.value }));
    };

    const handleRereadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateBookData({ reread: e.target.checked }));
    };

    const handleStarClick = (rating: number) => {
        dispatch(updateBookData({ rating }));
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateBookData({ comment: e.target.value }));
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
                        id='fileInput-book'
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
                        value={bookData.title}
                        onChange={handleTitleChange}
                        className='title-input'
                    />
                    <div className='info-row'>
                        <span className='info-label'>Author</span>
                        <input
                            type='text'
                            value={bookData.author}
                            onChange={handleAuthorChange}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Publisher</span>
                        <input
                            type='text'
                            value={bookData.publisher}
                            onChange={handlePublisherChange}
                            className='info-input'
                        />
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Genre</span>
                        <input
                            type='text'
                            value={bookData.genre}
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
                                className={`star ${star <= bookData.rating ? 'filled' : 'empty'}`}
                                onClick={() => handleStarClick(star)}
                            >
                                {star <= bookData.rating ? (
                                    <StarFullIcon className="star-icon filled" fill="var(--color-xl)" width="20" />
                                ) : (
                                    <StarEmptyIcon className="star-icon empty" fill="var(--color-xl)" width="20" />
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
                            value={bookData.startDate}
                            onChange={handleStartDateChange}
                            className='date-input'
                        />
                        <span className='date-separator'> ~ </span>
                        <input
                            type='date'
                            value={bookData.endDate}
                            onChange={handleEndDateChange}
                            className='date-input'
                        />
                    </div>
                </div>

                <div className='comment-group'>
                    <span className='comment-label'>Comment</span>
                    <textarea
                        placeholder='책에 대한 생각을 적어보세요.'
                        value={bookData.comment}
                        onChange={handleCommentChange}
                        className='comment-textarea'
                        rows={6}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookContent;