import React, { useState, useEffect } from 'react';
import { tagAPI, transformServerTagsToFrontendTags } from '../../services/api';
import { Tag } from '../../types/calendar.types';

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
  const [allTags, setAllTags] = useState<Tag[]>([]); // 🆕 전체 태그 목록
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState('gray');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 🆕 로딩 상태

  // const colors = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'white'];

  // 🆕 전체 태그 목록 조회
  const loadAllTags = async () => {
    try {
      setIsLoading(true);
      const response = await tagAPI.getTags();
      const frontendTags = transformServerTagsToFrontendTags(response.data);
      setAllTags(frontendTags);
    } catch (error) {
      console.error('태그 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTags(currentTags || []);
      setInputText('');
      setEditingTagId(null);
      loadAllTags(); // 🆕 모달 열릴 때 태그 목록 조회
    }
  }, [isOpen, currentTags]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelect(tags);
      onClose();
    }
  };

  const generateId = () => Date.now().toString();

  // 🆕 수정된 태그 추가/수정 핸들러
  const handleAddTag = async () => {
    if (!inputText.trim()) return;

    try {
      if (editingTagId) {
        // 수정 모드 - API 호출
        const tagToUpdate = { id: editingTagId, name: inputText.trim(), color: selectedColor };
        await tagAPI.updateTag(editingTagId, tagToUpdate);
        
        // 로컬 상태 업데이트
        setTags(prev => prev.map(tag => 
          tag.id === editingTagId 
            ? { ...tag, name: inputText.trim(), color: selectedColor }
            : tag
        ));
        setEditingTagId(null);
      } else {
        // 추가 모드 - API 호출
        const newTag: Tag = {
          id: generateId(),
          name: inputText.trim(),
          color: selectedColor
        };
        const response = await tagAPI.createTag(newTag);
        
        // 서버에서 받은 실제 ID로 업데이트
        const createdTag = {
          id: response.data.id.toString(),
          name: response.data.name,
          color: response.data.color
        };
        
        setTags(prev => [...prev, createdTag]);
        setAllTags(prev => [...prev, createdTag]); // 전체 목록에도 추가
      }
      
      setInputText('');
      await loadAllTags();
    } catch (error) {
      console.error('태그 저장 실패:', error);
      alert('태그 저장에 실패했습니다.');
    }
  };

  const handleTagClick = (tag: Tag) => {
    setInputText(tag.name);
    setSelectedColor(tag.color);
    setEditingTagId(tag.id);
  };

  // 🆕 수정된 태그 삭제 핸들러
  const handleTagRemove = async (tagId: string) => {
    try {
      await tagAPI.deleteTag(tagId);
      
      // 로컬 상태 업데이트
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      setAllTags(prev => prev.filter(tag => tag.id !== tagId));
      
      if (editingTagId === tagId) {
        setInputText('');
        setEditingTagId(null);
      }
    } catch (error) {
      console.error('태그 삭제 실패:', error);
      alert('태그 삭제에 실패했습니다.');
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
                disabled={!inputText.trim() || isLoading}
            >
                {editingTagId ? '수정' : '추가'}
            </button>
          </div>

          {/* 색상 선택
          <div className="color-selection">
            {colors.map((color) => (
              <div
                key={color}
                className={`color-option ${color} ${selectedColor === color ? 'selected' : ''}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div> */}

          {/* 🆕 전체 태그 목록 표시 */}
          <div className="current-tags-section">
            <span className="section-title">전체 태그 목록</span>
            {isLoading ? (
              <div>로딩 중...</div>
            ) : (
              <div className="current-tags">
                {allTags.map((tag) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleTagModal;