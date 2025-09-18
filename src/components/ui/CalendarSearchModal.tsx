import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CalendarSearchIconProps from '../../assets/icons/CalendarSearchIcon';
import { fetchSearchedSchedules, clearSearchedEvents } from '../../store/slices/calendarSlice';

interface SearchResult {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface CalendarSearchModalProps {
  showSearchButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const CalendarSearchModal: React.FC<CalendarSearchModalProps> = ({
  showSearchButton = true,
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const searchedEvents = useSelector((state: any) => state.calendar.searchedEvents);
  const isLoadingSearches = useSelector((state: any) => state.calendar.isLoadingSearches);

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const openModal = () => {
    setInternalIsOpen(true);
    setSearchQuery('');
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
    dispatch(clearSearchedEvents());
  };

  // 더미데이터 (주석처리)
  /*
  const allResults: SearchResult[] = useMemo(() => [
    {
      id: '1',
      title: '병원예약',
      date: '2023년 7월 13일',
      time: '10:30 - 11:00',
      category: 'meeting'
    },
    // ... 나머지 더미데이터들
  ], []);
  */

  // API 검색 호출
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchSearchedSchedules(searchQuery) as any);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      dispatch(clearSearchedEvents());
    }
  }, [searchQuery, dispatch]);

  // API 데이터를 기존 형식으로 변환
  const filteredResults = useMemo(() => {
    console.log('searchQuery:', searchQuery);
    console.log('searchedEvents:', searchedEvents);
    
    if (!searchQuery.trim()) return [];
    
    const results = searchedEvents.map((event: any) => {
      console.log('processing event:', event);
      
      // 날짜 포맷팅
      let dateStr = '';
      let timeStr = '';
      
      if (event.start) {
        const startDate = new Date(event.start);
        dateStr = startDate.toLocaleDateString('ko-KR');
        
        if (event.allDay) {
          timeStr = '종일';
        } else {
          const startTime = startDate.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          });
          
          if (event.end) {
            const endDate = new Date(event.end);
            const endTime = endDate.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            });
            timeStr = `${startTime} - ${endTime}`;
          } else {
            timeStr = startTime;
          }
        }
      }

      const result = {
        id: event.id || '',
        title: event.title || '',
        date: dateStr,
        time: timeStr
      };
      
      console.log('converted result:', result);
      return result;
    });
    
    console.log('final results:', results);
    return results;
  }, [searchedEvents, searchQuery]);

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
    }
    closeModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedItem(null);
  };

  return (
    <>
      {showSearchButton && (
        <div className="search-button-container">
          <button 
            className="search-trigger-button"
            onClick={openModal}
          >
           <CalendarSearchIconProps fill="var(--color-xl)"/>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container">
            <div className="modal-header">
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
              <button className="confirm-button" onClick={handleConfirm}>
                ✓
              </button>
            </div>

            <div className="search-section">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="일정 제목, 날짜, 시간을 검색하세요"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
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
                {isLoadingSearches ? (
                  <div className="no-results">
                    <p>검색 중...</p>
                  </div>
                ) : filteredResults.length === 0 && searchQuery.trim() ? (
                  <div className="no-results">
                    <p>'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  filteredResults.map((item: SearchResult) => (
                    <div
                      key={item.id}
                      className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className={`category-icon work`} />
                      <div className="event-info">
                        <div className="event-title">{item.title}</div>
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