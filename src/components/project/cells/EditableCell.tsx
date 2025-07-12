import React, { useState, useRef, useEffect } from 'react'

interface EditableCellProps {
    value: string;
    onUpdate: (newValue: string) => void;
    placeholder?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
    value,
    onUpdate,
    placeholder = '프로젝트 제목을 입력하세요'
}) => {
    const [ isEditing, setIsEditing ] = useState(false);
    const [ editValue, setEditValue ] = useState(value);
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

    if (isEditing) {
        return (
            <input
                ref={ inputRef }
                value={ editValue }
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={ handleKeyDown}
                onBlur={ handleBlur }
                className="editable-cell__input"
                placeholder={ placeholder }
            />
        );
    }

    return (
        <div
            className="editable-cell__display"
            onClick={() => setIsEditing(true)} 
        >
            { value || placeholder }
        </div>
    );
};

export default EditableCell