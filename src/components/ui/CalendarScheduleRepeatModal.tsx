import React, { useState, useEffect } from 'react';
import { RoundArrowIcon } from '../../assets/icons';

interface CalendarScheduleRepeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue?: string;
}

const CalendarScheduleRepeatModal: React.FC<CalendarScheduleRepeatModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('매일');
  const [customInterval, setCustomInterval] = useState(3);
  const [endDate, setEndDate] = useState('2025년 7월 21일');

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 현재 값으로 초기화
      if (currentValue) {
        // 현재 값을 파싱해서 상태에 반영
        // 예: "3일 간격으로 반복" -> selectedPeriod: "매일", customInterval: 3
        parseCurrentValue(currentValue);
      }
    }
  }, [isOpen, currentValue]);

  const parseCurrentValue = (value: string) => {
    // 현재 값 파싱 로직 (필요에 따라 구현)
    if (value.includes('매일')) {
      setSelectedPeriod('매일');
    } else if (value.includes('매주')) {
      setSelectedPeriod('매주');
    } else if (value.includes('매달')) {
      setSelectedPeriod('매달');
    } else if (value.includes('매년')) {
      setSelectedPeriod('매년');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // 선택된 값을 부모에게 전달
      const finalValue = generateRepeatValue();
      onSelect(finalValue);
      onClose();
    }
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
  };

  const generateRepeatValue = () => {
    if (selectedPeriod === '없음') {
      return '';
    }
    
    if (customInterval === 1) {
      return selectedPeriod;
    } else {
      const intervalText = selectedPeriod === '매일' ? '일' : 
                          selectedPeriod === '매주' ? '주' : 
                          selectedPeriod === '매달' ? '달' : '년';
      return `${customInterval}${intervalText} 간격으로 반복`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="repeat-modal-overlay" onClick={handleOverlayClick}>
      <div className="repeat-modal-container">
        {/* 모달 헤더 */}
        <div className="repeat-modal-header">
          <h3>일정 반복 : 3일 간격으로 반복</h3>
        </div>

        {/* 모달 내용 */}
        <div className="repeat-modal-content">
          {/* 반복 주기 선택 */}
          <div className="period-selection">
            {['없음', '매주', '매달', '매년'].map((period) => (
              <button
                key={period}
                className={`period-button ${selectedPeriod === period ? 'selected' : ''}`}
                onClick={() => handlePeriodSelect(period)}
              >
                {period}
              </button>
            ))}
          </div>

          {/* 간격 설정 */}
          <div className="interval-setting">
            <div className="interval-input-container">
              <input
                type="number"
                value={customInterval}
                onChange={(e) => setCustomInterval(Number(e.target.value))}
                min="1"
                max="999"
                className="interval-input"
              />
              <span className="interval-text">일 간격으로 반복</span>
            </div>
          </div>

          {/* 반복 종료일 */}
          <div className="end-date-setting">
            <span className="end-date-label">반복 종료일</span>
            <div className="end-date-value">{endDate} 까지 반복</div>
          </div>

          {/* 반복 안함 버튼 */}
          <div className="no-repeat-section">
            <button
              className="no-repeat-button"
              onClick={() => {
                onSelect('');
                onClose();
              }}
            >
              <RoundArrowIcon></RoundArrowIcon> 반복 안함
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleRepeatModal;