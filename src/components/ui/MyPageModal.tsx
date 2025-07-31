import React from "react";

interface MyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyPageModal: React.FC<MyPageModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="mypage-modal-overlay" onClick={onClose}>
      <div className="mypage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mypage-modal__header">
          <div className="mypage-modal__title-section">
            <div className="mypage-modal__user">로그인한 유저의</div>
            <h1 className="mypage-modal__title">MyPage</h1>
            <button className="mypage-modal__close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="mypage-modal__content">
          {/* 계정 섹션 */}
          <div className="mypage-modal__section">
            <div className="mypage-modal__info-list">
              <h2 className="mypage-modal__section-title">계정</h2>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">이름</div>
                <div className="mypage-modal__value">우민혁</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">닉네임</div>
                <div className="mypage-modal__value">우감자</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">비밀번호</div>
                <div className="mypage-modal__value">인증이 필요합니다</div>
              </div>
            </div>
            
            <div className="mypage-modal__button-group">
              <button className="mypage-modal__action-btn">이름 변경</button>
              <button className="mypage-modal__action-btn">닉네임 변경</button>
              <button className="mypage-modal__action-btn">비밀번호 변경</button>
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="mypage-modal__section">
            <div className="mypage-modal__info-list">
              <h2 className="mypage-modal__section-title">정보</h2>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">이용버전</div>
                <div className="mypage-modal__value">무료버전</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">시작일</div>
                <div className="mypage-modal__value">2025.06.19</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">일정 총 사용량</div>
                <div className="mypage-modal__value">123개</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">다이어리 총 사용량</div>
                <div className="mypage-modal__value">2,302개</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">프로젝트 총 사용량</div>
                <div className="mypage-modal__value">125개</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">패치버전</div>
                <div className="mypage-modal__value">1.14.2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;