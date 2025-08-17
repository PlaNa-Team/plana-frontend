import React, { useState, useEffect } from 'react';
import { TimeIcon, ColorIcon, RoundArrowIcon, TagIcon, BellIcon, LocationIcon, NoteIcon } from '../../assets/icons';
import CalendarScheduleRepeatModal from './CalendarScheduleRepeatModal';
import CalendarScheduleAlramModal from './CalendarScheduleAlramModal';
import CalendarScheduleTagModal from './CalendarScheduleTagModal';
import { ScheduleFormData, Tag } from '../../types/calendar.types';
import { calendarAPI } from '../../services/api';


interface CalendarScheduleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';  // 🔑 추가/수정 모드 구분
  selectedDate?: string; // + 버튼 클릭시 선택된 날짜
  scheduleData?: ScheduleFormData; // 수정할 일정 데이터 (수정 모드일 때만)
  onSave: (data: ScheduleFormData) => void;
  onDelete?: (id: string) => void; // 수정 모드일 때만
}

const CalendarScheduleAddModal: React.FC<CalendarScheduleAddModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedDate,
  scheduleData,
  onSave,
  onDelete
}) => {

  // 🔄 모드에 따른 초기값 설정
  const getInitialFormData = (): ScheduleFormData => {
    if (mode === 'edit' && scheduleData) {
      // 수정 모드: 기존 데이터 사용
      return { ...scheduleData };
    } else {
      // 추가 모드: 빈 폼 + 선택된 날짜
      const defaultDate = selectedDate || new Date().toISOString().split('T')[0];
      return {
        title: '',
        startDate: defaultDate,
        startTime: '09:00',
        endDate: defaultDate,
        endTime: '10:00',
        isAllDay: false,
        color: 'red',
        category: 'work',
        description: '',
        location: '',
        memo: '',
        repeatValue: '',
        alarmValue: '',
        tags: []
      };
    }
  };

  const [formData, setFormData] = useState<ScheduleFormData>(getInitialFormData);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(formData.tags || []);

   // 모달 관련 상태 (일정반복, 알람, 태그)
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

   // 🔄 모드나 데이터가 변경되면 폼 초기화
  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setSelectedTags(initialData.tags || []);
    }
  }, [isOpen, mode, scheduleData, selectedDate]);

  // 폼 데이터 업데이트 헬퍼 함수
  const updateFormData = (updates: Partial<ScheduleFormData>) => {
    setFormData((prev:any) => ({ ...prev, ...updates }));
  };

  // 클릭 핸들러 (일정반복, 알람, 태그)
  const handleRepeatClick = () => setIsRepeatModalOpen(true);
  const handleAlarmClick = () => setIsAlarmModalOpen(true);
  const handleTagClick = () => setIsTagModalOpen(true);

  // 모달 닫기 (일정 반복, 알람, 태그)
  const handleRepeatModalClose = () => setIsRepeatModalOpen(false);
  const handleAlarmModalClose = () => setIsAlarmModalOpen(false);
  const handleTagModalClose = () => setIsTagModalOpen(false);

   // 모달에서 값 선택 시 (일정 반복, 알람, 태그)
  const handleRepeatSelect = (value: string) => {
    updateFormData({ repeatValue: value });
    setIsRepeatModalOpen(false);
  };

  const handleAlarmSelect = (value: string) => {
    updateFormData({ alarmValue: value });
    setIsAlarmModalOpen(false);
  };

  const handleTagSelect = (tags: Tag[]) => {
    setSelectedTags(tags);
    updateFormData({ tags });
    setIsTagModalOpen(false);
  };

  // 개별 태그 제거 핸들러
  const handleTagRemove = (tagId: string) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(newTags);
    updateFormData({ tags: newTags });
  };

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

 // 🔑 저장 버튼 클릭 - API 호출 추가
  const handleSave = async () => {
    try {
      const finalData = {
        ...formData,
        tags: selectedTags
      };

      if (mode === 'add') {
        // 새 일정 생성
        await calendarAPI.createSchedule(finalData);
        console.log('일정이 성공적으로 생성되었습니다.');
      } else {
        // 기존 일정 수정 (향후 구현 예정)
        console.log('일정 수정 기능은 향후 구현 예정입니다.');
      }

      // 성공 시 콜백 호출 및 모달 닫기
      onSave(finalData);
      onClose();
    } catch (error) {
      console.error('일정 저장 실패:', error);
      alert(error instanceof Error ? error.message : '일정 저장에 실패했습니다.');
    }
  };

    // 색상 선택 핸들러
  const handleColorSelect = (color: string) => {
    updateFormData({ color });
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
            <button className="confirm-button" onClick={handleSave}>
              ✓
            </button>
          </div>

          {/* 모달 내용 */}
          <div className="add-modal-content">
            {/* 제목 입력 */}
            <div className="form-section">
              <div className="form-row">
                <div className="icon-container">
                  <div className={`color-picker-indicator  ${formData.color}`}></div>
                </div>
                <input type="text" className="title-input" placeholder="제목" value={formData.title} onChange={(e) => updateFormData({ title: e.target.value })}
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
                    <div 
                    key={color} 
                    className={`color-option ${color} ${formData.color === color ? 'selected' : ''}`}
                    onClick={() => handleColorSelect(color)} 
                    role="radio" 
                    aria-checked={formData.color === color} 
                    tabIndex={0} 
                    onKeyDown={(e) => {
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
                      <input
                        type="date"
                         value={formData.startDate}
                        onChange={(e) => updateFormData({ startDate: e.target.value })}
                        className="hidden-date-input"
                      />
                      {!formData.isAllDay && (
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => updateFormData({ startTime: e.target.value })}
                          className="hidden-time-input"
                        />
                      )}
                    </div>
                    <span className="arrow">〉</span>
                    <div className="date-time-group">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateFormData({ endDate: e.target.value })}
                        className="hidden-date-input"
                      />
                      {!formData.isAllDay && (
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => updateFormData({ endTime: e.target.value })}
                          className="hidden-time-input"
                        />
                      )}
                    </div>
                  </div>
                  <div className="btn-spacebox">  
                    <button 
                      className={`all-day-button ${formData.isAllDay ? 'active' : ''}`}
                      onClick={() => updateFormData({ isAllDay: !formData.isAllDay })}
                    >
                      하루종일
                    </button>
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
                    {formData.repeatValue || '반복 없음'}
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
                    {selectedTags.map((tag) => (
                      <span 
                        key={tag.id} 
                        className={`tag ${tag.color}`}
                        onClick={() => handleTagRemove(tag.id)}
                        style={{ cursor: 'pointer' }}
                        title="클릭하여 삭제"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div>
                    <button 
                      className="add-tag-button"
                      onClick={handleTagClick}    
                    >
                      +
                    </button>
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
                  {formData.alarmValue  || '알림 없음'} 
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
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
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
                  value={formData.memo}
                  onChange={(e) => updateFormData({ memo: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 반복 설정 모달*/}
      <CalendarScheduleRepeatModal
        isOpen={isRepeatModalOpen}
        onClose={handleRepeatModalClose}
        onSelect={handleRepeatSelect}
        currentValue={formData.repeatValue || ''}
      />
      {/*알람 설정 모달*/}
      <CalendarScheduleAlramModal
        isOpen={isAlarmModalOpen}
        onClose={handleAlarmModalClose}
        onSelect={handleAlarmSelect}
        currentValue={formData.alarmValue || ''}
      />
      {/*태그 설정 모달*/}
      <CalendarScheduleTagModal
        isOpen={isTagModalOpen}
        onClose={handleTagModalClose}
        onSelect={handleTagSelect}
        currentTags={selectedTags}
      />
    </>
  );
};

export default CalendarScheduleAddModal;