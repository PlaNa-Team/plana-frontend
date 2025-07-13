import React, { useState, useRef, useEffect } from 'react'

interface EditableCellProps {
    value: string;
    onUpdate: (newValue: string) => void;
    placeholder?: string;
    showPlaceholder?: boolean;
    onDetailClick?: () => void;
    showDetailButton?: boolean;
    maxLength?: number;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
    value,
    onUpdate,
    placeholder = '프로젝트 제목을 입력하세요',
    showPlaceholder = true,
    onDetailClick,
    showDetailButton = false,
    maxLength = 30
}) => {
    const [ isEditing, setIsEditing ] = useState(false);
    const [ editValue, setEditValue ] = useState(value);
    const [ isHovered, setIsHovered ] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (editValue.trim() !== value) {
            onUpdate(editValue.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        handleSave();
    }

    const handleDetailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDetailClick?.();
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setEditValue(newValue);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={ inputRef }
                value={ editValue }
                onChange={ handleInputChange }
                onKeyDown={ handleKeyDown }
                onBlur={ handleBlur }
                className="editable-cell__input"
                placeholder={ placeholder }
                maxLength={ maxLength }
            />
        );
    }

    return (
        <div
            className={`editable-cell__display ${showDetailButton ? 'editable-cell__display--with-button' : ''}`}
            onClick={() => {
                if (showPlaceholder || value.trim()) {
                    setIsEditing(true);
                }
            }} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={`editable-cell__text ${!value && showPlaceholder ? 'editable-cell__text--placeholder' : ''}`}>
                {value || (showPlaceholder ? placeholder : '')}
            </span>
            {showDetailButton && value && isHovered && (
                <button
                    className="editable-cell__detail-button"
                    onClick={handleDetailClick}
                >
                    자세히
                </button>
            )}
        </div>
    );
};

export default EditableCell