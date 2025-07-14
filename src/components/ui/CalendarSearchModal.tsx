import React, { useState } from 'react';    

interface SearchResult {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'meeting' | 'personal' | 'work';
}

interface CalendarSearchModalProps {
  // 검색 버튼을 렌더링할지 여부
  showSearchButton?: boolean;
  // 외부에서 모달 상태를 제어하고 싶을 때 (옵션)
  isOpen?: boolean;
  onClose?: () => void;
}

const CalendarSearchModal: React.FC<CalendarSearchModalProps> = ({
  showSearchButton = true,
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  // 내부 상태로 모달 관리
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('예약');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  // 외부에서 제어하는지, 내부에서 제어하는지 결정
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const openModal = () => setInternalIsOpen(true);
  const closeModal = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setSelectedItem(null);
    setSearchQuery('예약');
  };

  // 기본 검색 결과 데이터
  const defaultResults: SearchResult[] = [
    {
      id: '1',
      title: '병원예약',
      date: '2023년 7월 13일',
      time: '10:30 - 11:00',
      category: 'meeting'
    },
    {
      id: '2',
      title: '미용실예약',
      date: '2023년 4월 22일',
      time: '12:00 - 14:00',
      category: 'personal'
    },
    {
      id: '3',
      title: '레스토랑예약',
      date: '2023년 4월 22일',
      time: '19:00 - 19:00',
      category: 'work'
    },
    {
      id: '4',
      title: '병원예약',
      date: '2023년 3월 30일',
      time: '10:30 - 11:00',
      category: 'meeting'
    },
    {
      id: '5',
      title: '병원예약',
      date: '2023년 2월 24일',
      time: '10:30 - 11:00',
      category: 'meeting'
    },
    {
      id: '6',
      title: '미용실예약',
      date: '2023년 2월 24일',
      time: '12:30 - 14:00',
      category: 'personal'
    },
    {
      id: '7',
      title: '병원예약',
      date: '2023년 1월 27일',
      time: '10:30 - 11:00',
      category: 'meeting'
    }
  ];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleItemClick = (item: SearchResult) => {
    setSelectedItem(item);
  };

  const handleConfirm = () => {
    if (selectedItem) {
      console.log('선택된 일정:', selectedItem);
      // 여기서 선택된 일정에 대한 처리 (예: 해당 날짜로 이동)
    }
    closeModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* 검색 버튼 (옵션) */}
      {showSearchButton && (
        <div className="search-button-container">
          <button 
            className="search-trigger-button"
            onClick={openModal}
          >
            🔍 일정 검색
          </button>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container">
            {/* 모달 헤더 */}
            <div className="modal-header">
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
              <button className="confirm-button" onClick={handleConfirm}>
                ✓
              </button>
            </div>

            {/* 검색 영역 */}
            <div className="search-section">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="검색어를 입력하세요"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 검색 결과 영역 */}
            <div className="results-section">
              <div className="results-title">검색 목록</div>
              <div className="results-list">
                {defaultResults.map((item) => (
                  <div
                    key={item.id}
                    className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className={`category-icon ${item.category}`} />
                    <div className="event-info">
                      <div className="event-title">{item.title}</div>
                      <div className="event-date">{item.date} {item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarSearchModal;