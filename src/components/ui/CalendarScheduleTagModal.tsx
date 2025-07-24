import React, { useState, useEffect } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CalendarScheduleTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tags: Tag[]) => void;
  currentTags: Tag[];
}

const CalendarScheduleTagModal: React.FC<CalendarScheduleTagModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentTags
}) => {
  const [tags, setTags] = useState<Tag[]>(currentTags || []);
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const colors = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'white'];

  useEffect(() => {
    if (isOpen) {
      setTags(currentTags || []);
      setInputText('');
      setEditingTagId(null);
    }
  }, [isOpen, currentTags]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelect(tags);
      onClose();
    }
  };

  const generateId = () => Date.now().toString();

  const handleAddTag = () => {
    if (!inputText.trim()) return;

    if (editingTagId) {
      // 수정 모드
      setTags(prev => prev.map(tag => 
        tag.id === editingTagId 
          ? { ...tag, name: inputText.trim(), color: selectedColor }
          : tag
      ));
      setEditingTagId(null);
    } else {
      // 추가 모드
      const newTag: Tag = {
        id: generateId(),
        name: inputText.trim(),
        color: selectedColor
      };
      setTags(prev => [...prev, newTag]);
    }
    
    setInputText('');
  };

  const handleTagClick = (tag: Tag) => {
    setInputText(tag.name);
    setSelectedColor(tag.color);
    setEditingTagId(tag.id);
  };

  const handleTagRemove = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    if (editingTagId === tagId) {
      setInputText('');
      setEditingTagId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tag-modal-overlay" onClick={handleOverlayClick}>
      <div className="tag-modal-container">
        {/* 모달 헤더 */}
        <div className="tag-modal-header">
          <h3>태그 추가</h3>
          <button className="tag-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* 모달 내용 */}
        <div className="tag-modal-content">
          {/* 입력 영역 */}
          <div className="tag-input-section">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="태그 이름을 입력하세요"
              className="tag-input"
              maxLength={10}
            />
            {/* 추가 버튼 */}
            <button
                className="add-tag-btn"
                onClick={handleAddTag}
                disabled={!inputText.trim()}
            >
                {editingTagId ? '수정' : '추가'}
            </button>
          </div>

          {/* 색상 선택 */}
          <div className="color-selection">
            {colors.map((color) => (
              <div
                key={color}
                className={`color-option ${color} ${selectedColor === color ? 'selected' : ''}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>

          {/* 현재 추가된 태그들 */}
          <div className="current-tags-section">
            <span className="section-title">현재 추가된 태그</span>
            <div className="current-tags">
              {tags.map((tag) => (
                <div key={tag.id} className="tag-item">
                  <span
                    className={`tag-chip ${tag.color} ${editingTagId === tag.id ? 'editing' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag.name}
                  </span>
                  <button
                    className="tag-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagRemove(tag.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleTagModal;