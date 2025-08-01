import React, { useState } from "react";
import { XIcon } from "../../assets/icons";

interface MyPageNameBtnModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const MyPageNameBtnModal: React. FC<MyPageNameBtnModalProps> = ({
    isOpen = false,
    onClose,
}) => {
    const [newName, serNewName] = useState("");
    const [showError, setShowError] = useState(false);

    // 비밀번호 변경 함수
    const handleNameUpdate = () => {
        // TODO: 실제 API 호출로 비밀번호 변경
        console.log("새 이름:", newName);
        
        // 모달 닫기 및 상태 초기화
        if (onClose) {
            onClose();
        }
        resetModal();
    };

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
                        <div className="mypagebtn-modal__title2">플래나와 함께 일상을 기록해봐요!</div>
                        <div className="mypagebtn-modal__title3">이름 변경</div>
                    </div>

                    {/* 닉네임 변경 칸 변경 단계 */}
                        <>
                            <div className="mypagebtn-modal__password-update">
                                <div className="mypagebtn-modal__inputbox-title">변경할 이름</div>
                                <div className="mypagebtn-modal__inputbox-insert">
                                    <input 
                                        type="text"
                                        placeholder="변경할 이름을 입력하세요"
                                        value={newName}
                                        onChange={(e) => serNewName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                className="mypagebtn-modal__update-btn" 
                                onClick={handleNameUpdate}
                            >
                                변경
                            </button>
                        </>
                </div>    
            </div>
        </div>
    );
}

export default MyPageNameBtnModal;