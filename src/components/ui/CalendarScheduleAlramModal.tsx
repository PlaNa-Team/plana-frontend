import React, { useState, useEffect } from 'react';

interface CalendarScheduleAlramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue?: string;
}

const CalendarScheduleAlramModal: React.FC<CalendarScheduleAlramModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue = ''
}) => {
  const [selectedAlarms, setSelectedAlarms] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && currentValue) {
      // 현재 값을 파싱해서 선택된 알림들로 설정
      // 예: "시각, 1분 전" -> ['시각', '1분 전']
      const alarms = currentValue.split(', ').filter(alarm => alarm.trim());
      setSelectedAlarms(alarms);
    }
  }, [isOpen, currentValue]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // 선택된 알림들을 문자열로 합쳐서 전달
      const finalValue = selectedAlarms.length > 0 ? selectedAlarms.join(', ') : '';
      onSelect(finalValue);
      onClose();
    }
  };

  const handleAlarmToggle = (alarm: string) => {
    setSelectedAlarms(prev => {
      if (prev.includes(alarm)) {
        return prev.filter(item => item !== alarm);
      } else {
        return [...prev, alarm];
      }
    });
  };

  const alarmOptions = [
    '시작',
    '1분 전',
    '5분 전', 
    '10분 전',
    '30분 전',
    '1시간 전',
    '2시간 전',
    '1일 전',
    '2일 전',
    '1주 전'
  ];

  if (!isOpen) return null;

  return (
    <div className="alarm-modal-overlay" onClick={handleOverlayClick}>
      <div className="alarm-modal-container">
        {/* 모달 헤더 */}
        <div className="alarm-modal-header">
          <h3>일정 알림</h3>
        </div>

        {/* 모달 내용 */}
        <div className="alarm-modal-content">
          {/* 알림 옵션 목록 */}
          <div className="alarm-options">
            {alarmOptions.map((alarm) => (
              <label key={alarm} className="alarm-option">
                <input
                  type="checkbox"
                  checked={selectedAlarms.includes(alarm)}
                  onChange={() => handleAlarmToggle(alarm)}
                  className="alarm-checkbox"
                />
                <span className="alarm-text">{alarm}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleAlramModal;