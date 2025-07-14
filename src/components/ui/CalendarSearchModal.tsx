import React, { useState, useMemo } from 'react';


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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  // 외부에서 제어하는지, 내부에서 제어하는지 결정
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const openModal = () => {
    setInternalIsOpen(true);
    setSearchQuery(''); // 모달 열 때 검색어 초기화
    setSelectedItem(null);
  };
  
  const closeModal = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setSelectedItem(null);
    setSearchQuery('');
  };

  // 기본 검색 결과 데이터 (useMemo로 메모이제이션)
  const allResults: SearchResult[] = useMemo(() => [
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
      title: '치과진료',
      date: '2023년 2월 24일',
      time: '10:30 - 11:00',
      category: 'meeting'
    },
    {
      id: '6',
      title: '헤어커트예약',
      date: '2023년 2월 24일',
      time: '12:30 - 14:00',
      category: 'personal'
    },
    {
      id: '7',
      title: '회사미팅',
      date: '2023년 1월 27일',
      time: '10:30 - 11:00',
      category: 'work'
    },
    {
      id: '8',
      title: '운동시간',
      date: '2023년 1월 20일',
      time: '18:00 - 19:00',
      category: 'personal'
    },
    {
      id: '9',
      title: '약속',
      date: '2023년 1월 15일',
      time: '15:00 - 16:00',
      category: 'personal'
    },
    {
      id: '10',
      title: '프로젝트 회의',
      date: '2023년 1월 10일',
      time: '14:00 - 16:00',
      category: 'work'
    }
  ], []); // 빈 의존성 배열로 한 번만 생성

  // 한글 자음 검색을 위한 함수
  const getConsonants = (text: string): string => {
    const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        // 한글인 경우 초성 추출
        const consonantIndex = Math.floor((code - 0xAC00) / 588);
        result += consonants[consonantIndex];
      } else {
        // 한글이 아닌 경우 그대로 추가
        result += text[i];
      }
    }
    
    return result;
  };

  // 실시간 검색 필터링 (useMemo로 최적화)
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allResults; // 검색어가 없으면 모든 결과 표시
    }
    
    const query = searchQuery.toLowerCase();
    
    return allResults.filter(item => {
      // 일반 텍스트 검색
      const normalSearch = 
        item.title.toLowerCase().includes(query) ||
        item.date.includes(searchQuery) ||
        item.time.includes(searchQuery);
      
      // 자음 검색
      const consonantSearch = 
        getConsonants(item.title).includes(searchQuery) ||
        getConsonants(item.date).includes(searchQuery);
      
      return normalSearch || consonantSearch;
    });
  }, [searchQuery, allResults]);

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
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedItem(null); // 검색어 변경 시 선택 해제
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
            🔍
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
                  placeholder="일정 제목, 날짜, 시간을 검색하세요"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus // 모달 열릴 때 자동 포커스
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
              <div className="results-title">
                검색 목록 
                {searchQuery && (
                  <span className="search-count">
                    ({filteredResults.length}개 결과)
                  </span>
                )}
              </div>
              <div className="results-list">
                {filteredResults.length === 0 ? (
                  <div className="no-results">
                    <p>'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  filteredResults.map((item) => (
                    <div
                      key={item.id}
                      className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className={`category-icon ${item.category}`} />
                      <div className="event-info">
                        <div className="event-title">
                          {/* 검색어 하이라이트 */}
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: item.title.replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark>$1</mark>'
                              )
                            }} />
                          ) : (
                            item.title
                          )}
                        </div>
                        <div className="event-date">{item.date} {item.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarSearchModal;