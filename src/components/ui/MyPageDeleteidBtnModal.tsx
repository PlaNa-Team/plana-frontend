import React, { useState  } from "react";
import { XIcon } from "../../assets/icons";
import { useAppDispatch  } from '../../store';
import { useNavigate } from 'react-router-dom'; // useNavigate import
import { deleteMemberAsync, clearAuthData } from '../../store/slices/authSlice'; // Thunk와 액션 import


interface MyPageDeleteidBtnModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const MyPageDeleteidBtnModal: React. FC<MyPageDeleteidBtnModalProps> = ({
    isOpen = false,
    onClose,
}) => {

    const [showError, setShowError] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

 // 모달 상태 초기화
    const resetModal = () => {

        setShowError(false);
    };



     // 회원 탈퇴 로직
    const handleDeleteMember = async () => {
        setIsLoading(true);
        try {
            // Thunk를 dispatch하고 Promise를 처리
            await dispatch(deleteMemberAsync()).unwrap();
            
            // 1. 로컬 스토리지, 쿠키 삭제 및 상태 초기화 (Slice에서 이미 처리)
            dispatch(clearAuthData());
            
            // 2. 모달 닫기
            handleClose();

            // 3. 로그인 페이지로 리다이렉트
            navigate('/login');

        } catch (error) {
            console.error('회원 탈퇴 실패:', error);
            // 에러 메시지 표시 로직 추가 (e.g., toast 메시지)
            alert(`회원 탈퇴 실패: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

        // 모달 닫기 시 상태 초기화
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        resetModal();
    };

    if(!isOpen) return null;

    return (
        <div className="mypagebtn-modal-overlay" onClick={handleClose}> 
            <div className="mypagebtn-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mypagebtn-modal__header">
                    <div className="mypagebtn-modal__title-section">
                        <button className="mypagebtn-modal__closebtn" onClick={handleClose}>
                            <XIcon fill="var(--color-xs)" />
                        </button>
                        <div className="mypagebtn-modal__title1">PlaNa</div>
                        <div className="mypagebtn-modal__title2">정말 가시는 겁니까..?ㅜㅜ</div>
                    </div>

                    {/* 닉네임 변경 칸 변경 단계 */}
                    <>
                    <div className="mypagebtn-modal__content">
                        <button 
                            className="mypagebtn-modal__update-btn" 
                            onClick={handleClose}
                        >
                            참을게
                        </button>
                        <button 
                            className="mypagebtn-modal__update-btn" 
                            onClick={handleDeleteMember}
                        >
                            응ㅂ2
                        </button>
                    </div>
                    </>
                </div>    
            </div>
        </div>
    );
}

export default MyPageDeleteidBtnModal;