import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from '../../store';
import { XIcon } from "../../assets/icons";
import { updateNicknameAsync } from '../../store/slices/authSlice';

interface MyPageNicknameBtnModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MyPageNicknameBtnModal: React.FC<MyPageNicknameBtnModalProps> = ({
  isOpen = false,
  onClose,
}) => {
  const [newNickName, setNewNickName] = useState("");
  const [showError, setShowError] = useState(false);
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleNickNameUpdate = async () => {
    // 입력값 검증
    if (!newNickName.trim()) {
      alert("변경할 닉네임을 입력해주세요.");
      return;
    }

    // 닉네임 길이 검증 (예시)
    if (newNickName.trim().length < 2 || newNickName.trim().length > 20) {
      alert("닉네임은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    try {
      // 현재 로컬스토리지의 user 정보 백업
      const currentUserData = localStorage.getItem('user');
      console.log('닉네임 변경 전 사용자 데이터:', currentUserData);
      
      // 로딩 상태는 Redux에서 관리되므로 별도 상태 관리 불필요
      await dispatch(updateNicknameAsync(newNickName.trim())).unwrap();
      
      // 변경 후 로컬스토리지 확인
      const updatedUserData = localStorage.getItem('user');
      console.log('닉네임 변경 후 사용자 데이터:', updatedUserData);
      
      alert("닉네임이 성공적으로 변경되었습니다.");
      
      // 성공 시 모달 닫기 및 상태 초기화
      handleClose();
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      setShowError(true);
      
      // 에러 메시지 표시 (Redux에서 관리되는 에러 또는 기본 메시지)
      const errorMessage = typeof error === 'string' ? error : "닉네임 변경에 실패했습니다. 다시 시도해 주세요.";
      alert(errorMessage);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    // 모달 닫을 때 상태 초기화
    setNewNickName("");
    setShowError(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickName(e.target.value);
    // 입력 시 에러 상태 초기화
    if (showError) {
      setShowError(false);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleNickNameUpdate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mypagebtn-modal-overlay" onClick={handleClose}>
      <div className="mypagebtn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mypagebtn-modal__header">
          <div className="mypagebtn-modal__title-section">
            <button 
              className="mypagebtn-modal__closebtn" 
              onClick={handleClose}
              disabled={isLoading}
            >
              <XIcon fill="var(--color-xs)" />
            </button>
            <div className="mypagebtn-modal__title1">PlaNa</div>
            <div className="mypagebtn-modal__title2">플래나와 함께 일상을 기록해봐요!</div>
            <div className="mypagebtn-modal__title3">닉네임 변경</div>
          </div>
          
          <div className="mypagebtn-modal__password-update">
            <div className="mypagebtn-modal__inputbox-title">변경할 닉네임</div>
            <div className="mypagebtn-modal__inputbox-insert">
              <input 
                type="text" 
                placeholder="변경할 닉네임을 입력하세요" 
                value={newNickName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                maxLength={20} // 최대 길이 제한
              />
            </div>
            {/* 에러 메시지 표시 */}
            {(showError || error) && (
              <div className="mypagebtn-modal__error-message" style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                {error || "닉네임 변경 중 오류가 발생했습니다."}
              </div>
            )}
          </div>
          
          <button 
            className="mypagebtn-modal__update-btn" 
            onClick={handleNickNameUpdate}
            disabled={isLoading || !newNickName.trim()}
            style={{
              opacity: isLoading || !newNickName.trim() ? 0.6 : 1,
              cursor: isLoading || !newNickName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '변경 중...' : '변경'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPageNicknameBtnModal;