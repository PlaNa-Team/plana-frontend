import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector  } from '../../store';
import { logout } from '../../store/slices/authSlice';
import MyPagePwBtnModal from '../ui/MyPagePwBtnModal';
import MyPageNicknameBtnModal from "../ui/MyPageNicknameBtnModal";
import MyPageNameBtnModal from "./MyPagenameBtnModal";

interface MyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}
  
// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const MyPageModal: React.FC<MyPageModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ✅ Redux 스토어에서 사용자 정보(user)를 가져옵니다.
  const user = useAppSelector(state => state.auth.user);
   

  const [isMyPagePwModalOpen, setIsMyPagePwModalOpen] = useState(false);
  const [isMyPageNicknameModalOpen, setisMyPageNicknameModalOpen] = useState(false);
  const [isMyPageNameModalOpen, setisMyPageNameModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    try {
    setIsLoggingOut(true);
    dispatch(logout());

    onClose();
    navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      
      dispatch(logout());
      onClose();
      navigate('/login');
    } finally { 
      setIsLoggingOut(false);
    }
  }

  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);

  if (!isOpen || !user) return null;

  // ✅ 이제 user 객체가 null이 아니므로 안전하게 접근 가능
  const createdAt = new Date(user.createdAt);

  return (
    <>
    <div className="mypage-modal-overlay" onClick={onClose}>
      <div className="mypage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mypage-modal__header">
          <div className="mypage-modal__title-section">
            <div className="mypage-modal__user">{user.nickname}</div>
            <h1 className="mypage-modal__title">MyPage</h1>
              {/* 로그아웃 버튼 - 로딩 상태 포함 */}
              <button className="mypage-modal__action-btn" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
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
                <div className="mypage-modal__value">{user.name}</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">닉네임</div>
                <div className="mypage-modal__value">{user.nickname}</div>
              </div>
              
              <div className="mypage-modal__info-row">
                <div className="mypage-modal__label">비밀번호</div>
                <div className="mypage-modal__value">인증이 필요합니다.</div>
              </div>
            </div>
            
            <div className="mypage-modal__button-group">
              <button className="mypage-modal__action-btn" onClick={() => setisMyPageNameModalOpen(true)}>이름 변경</button>
              <button className="mypage-modal__action-btn" onClick={() => setisMyPageNicknameModalOpen(true)}>닉네임 변경</button>
              <button className="mypage-modal__action-btn" onClick={() => setIsMyPagePwModalOpen(true)} >비밀번호 변경</button>
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
                <div className="mypage-modal__value">{createdAt ? formatDate(createdAt) : '정보 없음'}</div>
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

    <MyPagePwBtnModal isOpen={isMyPagePwModalOpen} onClose={() => setIsMyPagePwModalOpen(false)} />
    <MyPageNicknameBtnModal isOpen={isMyPageNicknameModalOpen} onClose={() => setisMyPageNicknameModalOpen(false)}/>
    <MyPageNameBtnModal isOpen={isMyPageNameModalOpen} onClose={()=> setisMyPageNameModalOpen(false)}/>
    </>
  );
};

export default MyPageModal;