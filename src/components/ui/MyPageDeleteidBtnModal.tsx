import React, { useState } from "react";
import { XIcon } from "../../assets/icons";

interface MyPageDeleteidBtnModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const MyPageDeleteidBtnModal: React. FC<MyPageDeleteidBtnModalProps> = ({
    isOpen = false,
    onClose,
}) => {

    const [showError, setShowError] = useState(false);


 // 모달 상태 초기화
    const resetModal = () => {

        setShowError(false);
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
                        <div className="mypagebtn-modal__title3">회원 탈퇴</div>
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