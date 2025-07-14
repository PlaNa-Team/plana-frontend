import React, { useRef, useEffect } from 'react'

const DetailInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    isPast?: boolean;
    onCtrlEnter?: () => void;
}> = ({ value, onChange, isPast = false , onCtrlEnter }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            onCtrlEnter?.();
        }
    };

    return (
        <textarea
            ref={ textareaRef }
            value={ value }
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={ handleKeyDown }
            placeholder='계획 내용을 입력하세요'
            className={`detail-input ${isPast ? 'detail-input--past' : ''}`}
            rows={1}
            style={{
                minHeight: '1.5rem',
                resize: 'none',
                overflow: 'hidden',
            }}
        />
    );
};

export default DetailInput