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
                <span className="form-icon">📝</span>
              </div>
              <input
                type="text"
                className="title-input"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* 색상 선택 */}
          <div className="form-section">
            <div className="form-row">
              <div className="icon-container">
                <div className="color-dot selected-color"></div>
              </div>
              <div className="color-picker">
                <div className="color-option black"></div>
                <div className="color-option pink"></div>
                <div className="color-option red"></div>
                <div className="color-option orange"></div>
                <div className="color-option yellow"></div>
                <div className="color-option green"></div>
                <div className="color-option blue"></div>
                <div className="color-option purple"></div>
                <div className="color-option gray"></div>
                <div className="color-option white"></div>
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