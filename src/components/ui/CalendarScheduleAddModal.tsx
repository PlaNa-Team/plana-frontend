import React, { useState } from 'react';
import { TimeIcon, ColorIcon, RoundArrowIcon, TagIcon, BellIcon, LocationIcon, NoteIcon } from '../../assets/icons';
import CalendarScheduleRepeatModal from './CalendarScheduleRepeatModal'; // 추가
import CalendarScheduleAlramModal from './CalendarScheduleAlramModal';

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

  //모달 관련 상태 ( 일정반복, 알람 )
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [repeatValue, setRepeatValue] = useState('');

  const [isAlramModalOpen, setIsAlramModalOpen] = useState(false);
  const [alramValue, setAlramValue] = useState('');

  //클릭 핸들러 ( 일정반복, 알람 )
  const handleRepeatClick = () => {
    setIsRepeatModalOpen(true);
  };

  const handleAlarmClick = () => {
    setIsAlramModalOpen(true);
  };


  //모달 닫기 ( 일정 반복, 알람)
  const handleRepeatModalClose = () => {
    setIsRepeatModalOpen(false);
  };

  const handleAlarmModalClose = () => {
    setIsAlramModalOpen(false);
  };

  //모달에서 값 선택 시 ( 일정 반복, 알람)
  const handleRepeatSelect = (value: string) => {
    setRepeatValue(value);
    setIsRepeatModalOpen(false);
  };

  const handleAlarmSelect = (value: string) => {
    setAlramValue(value);
    setIsAlramModalOpen(false);
  };  



  //오버레이 클릭 핸들러
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
    <>
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
                  <ColorIcon width={24} height={24} fill="var(--color-xl)" className="color-icon" />
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
                  <TimeIcon width={24} height={24} fill="var(--color-xl)" className="time-icon" />
                </div>
                <div className="datetime-container">
                    <div className="date-spacebox">
                      <div className="date-time-group">
                        <span className="date-text">{startDate.split('-')[1]}월 {startDate.split('-')[2]}일 (월)</span>
                        <span className="time-text">{startTime}</span>
                      </div>
                      <span className="arrow">〉</span>
                      <div className="date-time-group">
                        <span className="date-text">{endDate.split('-')[1]}월 {endDate.split('-')[2]}일 (월)</span>
                        <span className="time-text">{endTime}</span>
                      </div>
                    </div>
                    <div className="btn-spacebox">  
                      <button className="all-day-button">하루종일</button>
                    </div>
                  </div>
              </div>
            </div>

            {/* 반복 설정 */}
            <div className="form-section">
              <div className="form-row">
                <div className="icon-container">
                  <RoundArrowIcon width={24} height={24} fill="var(--color-xl)" className="repeat-icon"/>
                </div>
                  <span 
                    className="form-label clickable" 
                    onClick={handleRepeatClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {repeatValue || '반복 없음'}
                </span>
              </div>
            </div>

            {/* 태그 */}
            <div className="form-section">
              <div className="form-row">
                <div className="icon-container">
                  <TagIcon width={24} height={24} fill="var(--color-xl)" className="tag-icon" />
                </div>
                <div className="tags-container">
                  <div className="tags-subcontainer">
                  <span className="tag selected">업무</span>
                  <span className="tag">집안일</span>
                  </div>
                  <div>
                  <button className="add-tag-button">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 */}
            <div className="form-section">
              <div className="form-row">
                <div className="icon-container">
                  <BellIcon width={24} height={24} fill="var(--color-xl)" className="bell-icon" />
                </div>
               <span 
                  className="form-label" 
                  onClick={handleAlarmClick}
                  style={{ cursor: 'pointer' }}
                > 
                  {alramValue || '알림 없음'} 
                </span>
              </div>
            </div>

            {/* 위치 */}
            <div className="form-section">
              <div className="form-row">
                <div className="icon-container">
                  <LocationIcon width={24} height={24} fill="var(--color-xl)" className="location-icon" />
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
                  <NoteIcon width={24} height={24} fill="var(--color-xl)" className="note-icon" />
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

      {/* 반복 설정 모달 */}
      <CalendarScheduleRepeatModal
        isOpen={isRepeatModalOpen}
        onClose={handleRepeatModalClose}
        onSelect={handleRepeatSelect}
        currentValue={repeatValue}
      />
      {/*알람 설정 모달*/}
      <CalendarScheduleAlramModal
        isOpen={isAlramModalOpen}
        onClose={handleAlarmModalClose}
        onSelect={handleAlarmSelect}
        currentValue={alramValue}
      />
    </>
  );
};

export default CalendarScheduleAddModal;