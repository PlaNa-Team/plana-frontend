import React, { useState } from 'react';

interface CalendarScheduleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

const CalendarScheduleAddModal: React.FC<CalendarScheduleAddModalProps> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2025-06-15');
  const [startTime, setStartTime] = useState('18:00');
  const [endDate, setEndDate] = useState('2025-06-15');
  const [endTime, setEndTime] = useState('20:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatType, setRepeatType] = useState('없음');
  const [selectedTags, setSelectedTags] = useState<string[]>(['업무']);
  const [reminder, setReminder] = useState('알림 없음');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedColor, setSelectedColor] = useState('red');

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    // 일정 저장 로직 추가 예정
    console.log('일정 저장');
    onClose();
  };

  // 색상 선택 핸들러 추가
  const handleColorSelect = (color: string) => {
  setSelectedColor(color);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
          <button className="confirm-button" onClick={handleConfirm}>
            ✓
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="add-modal-content">
          {/* 제목 입력 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <div className={`color-picker-indicator ${selectedColor}`}></div>
              </div>
              <input type="text" className="title-input" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)}
                id="schedule-title"
                name="title"
              />
            </div>
          </div>

        {/* 색상 선택 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <div className={`color-dot selected-color ${selectedColor}`}></div>
              </div>
              <div className="color-picker">
                {['black', 'pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'white'].map((color) => (
                  <div key={color} className={`color-option ${color} ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => handleColorSelect(color)} role="radio" aria-checked={selectedColor === color} tabIndex={0} onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleColorSelect(color);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 날짜 및 시간 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">🕐</span>
              </div>
              <div className="datetime-container">
                <div className="date-time-group">
                  <span className="date-text">{startDate.split('-')[1]}월 {startDate.split('-')[2]}일 (월)</span>
                  <span className="time-text">{startTime}</span>
                </div>
                <span className="arrow">〉</span>
                <div className="date-time-group">
                  <span className="date-text">{endDate.split('-')[1]}월 {endDate.split('-')[2]}일 (월)</span>
                  <span className="time-text">{endTime}</span>
                </div>
                <button className="all-day-button">하루종일</button>
              </div>
            </div>
          </div>

          {/* 반복 설정 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">🔄</span>
              </div>
              <span className="form-label">반복 없음</span>
            </div>
          </div>

          {/* 태그 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">🏷️</span>
              </div>
              <div className="tags-container">
                <span className="tag selected">업무</span>
                <span className="tag">집안일</span>
                <button className="add-tag-button">+</button>
              </div>
            </div>
          </div>

          {/* 알림 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">🔔</span>
              </div>
              <span className="form-label">알림 없음</span>
            </div>
          </div>

          {/* 위치 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">📍</span>
              </div>
              <input
                type="text"
                className="location-input"
                placeholder="위치"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* 메모 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <span className="form-icon">💬</span>
              </div>
              <textarea
                className="memo-textarea"
                placeholder="메모"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleAddModal;